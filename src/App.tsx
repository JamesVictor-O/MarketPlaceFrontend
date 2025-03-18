import { RouterProvider, createBrowserRouter, createRoutesFromElements,Route } from "react-router-dom";
import LandingPage from "./page/LandingPage";
import './App.css'

function App() {
  const router=createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<LandingPage/>}>
        </Route>
    )
)
 
  return (
    <RouterProvider router={router}/>
  )
}

export default App
