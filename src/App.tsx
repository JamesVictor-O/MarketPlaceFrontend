import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import LandingPage from "./page/LandingPage";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import BuyersPage from "./page/BuyersPage";
import Root from "./Root";
import { sepolia,baseSepolia } from "wagmi/chains";
import CarDetailsPage from "./page/CarDetailPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer} from 'react-toastify';
import DealerRegistrationForm from "./components/DealerRegistrationForm";
import DealerDashboard from "./page/DealersDashBoard";

import "./App.css";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
        <Route index element={<LandingPage />} />
        <Route path="dealersignup" element={<DealerRegistrationForm />} />
        <Route path="dealersdashboard" element={<DealerDashboard />} />
        <Route path="buyersPage" element={<BuyersPage />}>
          <Route path="cardetails/:id" element={<CarDetailsPage />} />
        </Route>
      </Route>
    )
  );

  const queryClient = new QueryClient();
  const config = getDefaultConfig({
    appName: "My RainbowKit App",
    projectId: "YOUR_PROJECT_ID",
    chains: [baseSepolia],
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3000} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
