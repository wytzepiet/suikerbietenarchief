import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body>
          <div id="smooth-wrapper">
            <div id="smooth-content">
              <div id="app" class="page flex flex-col items-center">
                {children}
              </div>
            </div>
          </div>
          {scripts}
        </body>
      </html>
    )}
  />
));
