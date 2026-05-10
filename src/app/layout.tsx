import "../styles/globals.css";

export const metadata = {
  title: "F1GPT",
  description: "The place to go for all your formaula one Questions!!!"
}

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

export default RootLayout;