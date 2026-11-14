import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'CareerPilot AI — Navigate Your Future with AI',
  description: 'A polished CareerPilot AI product prototype for exploring careers, colleges, and personalized roadmaps.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-[#f7faff]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}