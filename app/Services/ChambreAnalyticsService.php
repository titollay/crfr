<?php

namespace App\Services;

use App\Models\Chambre;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ChambreAnalyticsService
{
    private const MONTH_LABELS = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
        'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
    ];

    /** @var Collection<int, object>|null */
    private ?Collection $reservationsCache = null;

    public function totalRooms(): int
    {
        return (int) Chambre::count();
    }

    /**
     * Précharge les réservations actives (hors « Annulée ») qui croisent [ $from , $fin ] (dates inclusives).
     */
    public function preloadReservationsForRange(Carbon $from, Carbon $to): void
    {
        $this->reservationsCache = DB::table('reservations')
            ->where('statut', '!=', 'Annulée')
            ->whereDate('date_fin', '>=', $from->toDateString())
            ->whereDate('date_debut', '<=', $to->toDateString())
            ->get(['id_chambre', 'date_debut', 'date_fin']);
    }

    public function kpiSnapshot(): array
    {
        $total = $this->totalRooms();
        $disponible = (int) Chambre::where('statut', 'Disponible')->count();
        $occupee = (int) Chambre::where('statut', 'Occupée')->count();

        return [
            'totalRooms' => $total,
            'availableRooms' => $disponible,
            'occupiedRooms' => $occupee,
            'occupancyRate' => $total > 0 ? (int) round(($occupee / $total) * 100) : 0,
        ];
    }

    public function occupiedRoomsOnDate(Carbon $date): int
    {
        $d = $date->toDateString();

        if ($this->reservationsCache !== null) {
            return $this->reservationsCache
                ->filter(static function ($r) use ($d) {
                    return $r->date_debut <= $d && $r->date_fin >= $d;
                })
                ->pluck('id_chambre')
                ->unique()
                ->count();
        }

        return (int) DB::table('reservations')
            ->where('statut', '!=', 'Annulée')
            ->whereDate('date_debut', '<=', $d)
            ->whereDate('date_fin', '>=', $d)
            ->selectRaw('COUNT(DISTINCT id_chambre) as c')
            ->value('c');
    }

    public function occupancyRateOnDate(Carbon $date): float
    {
        $total = $this->totalRooms();
        if ($total === 0) {
            return 0.0;
        }

        $occ = $this->occupiedRoomsOnDate($date);

        return round(($occ / $total) * 100, 1);
    }

    public function averageOccupancyForMonth(int $year, int $month): float
    {
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $sum = 0.0;
        $n = 0;
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $sum += $this->occupancyRateOnDate($d);
            $n++;
        }

        return $n > 0 ? round($sum / $n, 1) : 0.0;
    }

    /**
     * @return list<array{month: string, rate: float}>
     */
    public function last12MonthsOccupancy(): array
    {
        $out = [];
        $cursor = now()->copy()->subMonths(11)->startOfMonth();
        for ($i = 0; $i < 12; $i++) {
            $y = (int) $cursor->year;
            $m = (int) $cursor->month;
            $out[] = [
                'month' => self::MONTH_LABELS[$m - 1],
                'rate' => $this->averageOccupancyForMonth($y, $m),
            ];
            $cursor->addMonth();
        }

        return $out;
    }

    /**
     * @return list<array{num_chambre: string, reservations: int}>
     */
    public function topReservedRooms(int $limit = 5): array
    {
        $rows = DB::table('reservations')
            ->join('chambres', 'reservations.id_chambre', '=', 'chambres.id_chambre')
            ->where('reservations.statut', '!=', 'Annulée')
            ->groupBy('chambres.id_chambre', 'chambres.num_chambre')
            ->selectRaw('chambres.num_chambre as num_chambre, COUNT(*) as reservations')
            ->orderByRaw('COUNT(*) DESC')
            ->limit($limit)
            ->get();

        return $rows->map(static fn ($r) => [
            'num_chambre' => (string) $r->num_chambre,
            'reservations' => (int) $r->reservations,
        ])->values()->all();
    }

    /**
     * @return array{year: int, month: int, days: list<array{day: int, occupied: bool, rate: float, occupiedRooms: int}>}
     */
    public function calendarMonth(int $year, int $month): array
    {
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $days = [];
        $total = $this->totalRooms();

        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $occ = $this->occupiedRoomsOnDate($d);
            $rate = $this->occupancyRateOnDate($d);
            $days[] = [
                'day' => $d->day,
                'occupied' => $total > 0 && $occ > 0,
                'rate' => $rate,
                'occupiedRooms' => $occ,
            ];
        }

        return [
            'year' => $year,
            'month' => $month,
            'days' => $days,
        ];
    }

    /**
     * @return array{
     *     kpi: array,
     *     monthlyOccupancy: list,
     *     topRooms: list,
     *     calendar: array
     * }
     */
    public function buildDashboard(int $calendarYear, int $calendarMonth): array
    {
        $calendarMonth = max(1, min(12, $calendarMonth));

        $rangeStart = now()->copy()->subMonths(11)->startOfMonth();
        $rangeEnd = now()->copy()->endOfMonth();
        $calStart = Carbon::create($calendarYear, $calendarMonth, 1)->startOfMonth();
        $calEnd = $calStart->copy()->endOfMonth();

        $preloadFrom = $calStart->lessThan($rangeStart) ? $calStart->copy() : $rangeStart->copy();
        $preloadTo = $calEnd->greaterThan($rangeEnd) ? $calEnd->copy() : $rangeEnd->copy();

        $this->preloadReservationsForRange($preloadFrom, $preloadTo);

        return [
            'kpi' => $this->kpiSnapshot(),
            'monthlyOccupancy' => $this->last12MonthsOccupancy(),
            'topRooms' => $this->topReservedRooms(5),
            'calendar' => $this->calendarMonth($calendarYear, $calendarMonth),
        ];
    }
}
