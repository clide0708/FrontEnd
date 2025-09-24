import './style.css'
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

export default function PageTransition({ children }) {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // tempo do vídeo
    return () => clearTimeout(timer)
  }, [location])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="page-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="page-loader"
          >
            <video autoPlay muted className="loader-video">
              <source src="/assets/videos/loading.mp4" type="video/mp4" />
            </video>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {children}
        </motion.div>
      )}
    </>
  )
}
