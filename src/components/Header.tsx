import { ConnectButton } from "@rainbow-me/rainbowkit";

// Type definitions
type NavItem = {
  name: string;
  href: string;
};

const Header = () => {
  // Navigation items
  const navItems: NavItem[] = [
    { name: "Market", href: "#" },
    { name: "Features", href: "#" },
    { name: "Community", href: "#" },
  ];

  return (
    <div>
      {/* Header/Navigation */}
      <header className="relative z-10 px-16 py-6  border-black shadow-2xl bg-gradient-to-br from-gray-900 to-blue-900">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold flex items-center">
              <span className="text-blue-400">Wheel</span>
              <span className="text-white">Quest</span>
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-blue-500 rounded-md">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-current text-white"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg ml-5">
            <ConnectButton.Custom>
              {({ account, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account;

                return (
                  <div>
                    {connected ? (
                      <button
                        onClick={openAccountModal}
                        className="flex items-center"
                      >
                        <span className="text-white font-medium">
                          {account.displayName}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={openConnectModal}
                        className="flex items-center"
                      >
                        <span className="text-white font-medium">
                          Connect Wallet
                        </span>
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;
