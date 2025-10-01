"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      richColors={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-2 group-[.toaster]:border-orange-300 group-[.toaster]:shadow-xl group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-orange-500 group-[.toast]:text-white group-[.toast]:hover:bg-orange-600 group-[.toast]:rounded-md group-[.toast]:font-bold",
          cancelButton:
            "group-[.toast]:bg-gray-200 group-[.toast]:text-gray-700 group-[.toast]:hover:bg-gray-300 group-[.toast]:rounded-md group-[.toast]:font-medium",
        },
        style: {
          background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
          border: '2px solid #FFA503',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(255, 165, 3, 0.15)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
