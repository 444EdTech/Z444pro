import React from "react"
import Navbar from "./Navbar"
import { ThemeProvider } from "../contexts/ThemeContext"
import { UserProvider } from "../contexts/UserContext"

function Layout({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">{children}</main>
        </div>
      </UserProvider>
    </ThemeProvider>
  )
}

export default Layout

