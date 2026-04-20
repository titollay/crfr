<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all();
        
        // Add full URLs for file type settings
        $settings->map(function($setting) {
            if ($setting->type === 'file' && $setting->value) {
                $setting->value = asset('storage/' . $setting->value);
            }
            return $setting;
        });

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            $setting = Setting::where('key', $key)->first();
            if (!$setting) continue;

            if ($setting->type === 'file' && $request->hasFile($key)) {
                if ($setting->value) {
                    Storage::disk('public')->delete($setting->value);
                }
                $path = $request->file($key)->store('settings', 'public');
                $setting->update(['value' => $path]);
            } else {
                $val = is_array($value) ? json_encode($value) : $value;
                $setting->update(['value' => $val]);
            }
        }

        return response()->json(['message' => 'Paramètres mis à jour avec succès']);
    }

    public function reset()
    {
        $defaults = [
            'site_name' => 'CRFR',
            'primary_color' => '#D97706',
            'site_logo' => null,
        ];

        foreach ($defaults as $key => $value) {
            $setting = Setting::where('key', $key)->first();
            if ($setting) {
                if ($setting->type === 'file' && $setting->value) {
                    Storage::disk('public')->delete($setting->value);
                }
                $setting->update(['value' => $value]);
            }
        }

        return response()->json(['message' => 'Paramètres réinitialisés aux valeurs par défaut']);
    }
}
