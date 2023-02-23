import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import { en } from "./en"
import { cn } from "./cn"

export const defaultNS = "common"
export const resources = { cn } as const

export const i18n = i18next.use(initReactI18next)

i18n
  .init({
    fallbackLng: "cn",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
  })
  .catch((error) => {
    // we are catching here to avoid lint's no-floating-promises error
    console.error("[Translation Service]:", error)
  })
