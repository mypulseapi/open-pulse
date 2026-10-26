// <script> tag entry: the global `Pulse` IS the client, so the documented
// Pulse.init/track/search calls resolve. A default export on the main entry
// cannot do this — esbuild assigns the module *namespace* to globalName, which
// puts the singleton at Pulse.default and leaves Pulse.init undefined.
import { PulseClient } from "./client"

;(globalThis as Record<string, unknown>).Pulse = new PulseClient()
