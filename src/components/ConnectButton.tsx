"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectButton() {
  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            aria-hidden={!ready}
            style={{
              opacity: ready ? 1 : 0,
              pointerEvents: ready ? "auto" : "none",
            }}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} className="gallery-connect-btn gallery-connect-btn--overlay">
                    Connect
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="gallery-connect-btn gallery-connect-btn--overlay gallery-connect-btn--warn"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <button onClick={openAccountModal} className="gallery-connect-btn gallery-connect-btn--overlay">
                  {account.displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
