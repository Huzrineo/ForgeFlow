package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()
	storage := NewStorage()
	engine := NewEngine(storage)
	triggerManager := NewTriggerManager(engine, storage)
	actionService := NewActionService(app)
	excelService := NewExcelService()

	err := wails.Run(&options.App{
		Title:             "ForgeFlow",
		Width:             1280,
		Height:            800,
		MinWidth:          1024,
		MinHeight:         600,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         true,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 30, G: 30, B: 30, A: 255}, // #1e1e1e to match app
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: app.startup,
		OnShutdown: func(ctx context.Context) {
			triggerManager.Shutdown()
			app.shutdown(ctx)
		},
		Bind: []interface{}{
			app,
			engine,
			storage,
			triggerManager,
			actionService,
			excelService,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			Theme:                windows.Dark,
			CustomTheme: &windows.ThemeSettings{
				DarkModeTitleBar:   windows.RGB(30, 30, 30),   // #1e1e1e
				DarkModeTitleText:  windows.RGB(212, 212, 212), // #d4d4d4
				DarkModeBorder:     windows.RGB(62, 62, 66),    // #3e3e42
				LightModeTitleBar:  windows.RGB(30, 30, 30),
				LightModeTitleText: windows.RGB(212, 212, 212),
				LightModeBorder:    windows.RGB(62, 62, 66),
			},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
