import { useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [received, setReceived] = useState(false);

  const [country, setCountry] = useState("USA");
  const [recipient, setRecipient] = useState("Maria Santos");
  const [amount, setAmount] = useState(200);

  const exchangeRates = {
    UAE: 15.6,
    USA: 56.2,
    SG: 41.3,
  };

  const handleSend = () => {
    setLoading(true);
    setStep(1);

    setTimeout(() => {
      setStep(2);
    }, 1500);

    setTimeout(() => {
      setStep(3);
      setReceived(true);
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-white p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-purple-400">
              MorphPadala
            </h1>

            <p className="text-gray-400 mt-2">
              Instant cross-border remittance for Filipino families.
            </p>
          </div>

          <div className="bg-[#151B2E] px-4 py-2 rounded-xl border border-purple-500">
            Powered by Morph
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Sender */}
          <div className="bg-[#151B2E] p-6 rounded-3xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-purple-300">
              Send Money
            </h2>

            <div className="space-y-4">

              <div>
                <label className="text-sm text-gray-400">
                  Sender Country
                </label>

                <select
  className="w-full mt-2 bg-[#0B1020] border border-gray-700 rounded-xl p-3"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
>
  <option value="USA">USA (USD)</option>
  <option value="UAE">UAE (AED)</option>
  <option value="SG">Singapore (SGD)</option>
</select>
              </div>

              <div>
                <label className="text-sm text-gray-400">
                  Recipient
                </label>

                <input
                  className="w-full mt-2 bg-[#0B1020] border border-gray-700 rounded-xl p-3"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">
                  Amount
                </label>

                <input
  className="w-full mt-2 bg-[#0B1020] border border-gray-700 rounded-xl p-3"
  value={amount}
  onChange={(e) => setAmount(Number(e.target.value))}
  type="number"
/>
              </div>

              <button
                onClick={handleSend}
                disabled={loading || received}
                className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl py-3 font-bold mt-4"
              >
                {received ? "Transfer Complete" : "Send with Morph"}
              </button>

            </div>
          </div>

          {/* Transfer */}
          <div className="bg-[#151B2E] p-6 rounded-3xl border border-gray-800">

            <h2 className="text-2xl font-bold mb-6 text-blue-300">
              Transfer Status
            </h2>

            <div className="space-y-5">

              <div className="p-4 rounded-xl border border-green-500 bg-green-500/10">
                <p className="font-semibold">
                  {step >= 1 ? "✓ " : ""}Converting Funds
                </p>

                <p className="text-sm text-gray-400">
                  Preparing stablecoin transfer...
                </p>
              </div>

              <div className="p-4 rounded-xl border border-green-500 bg-green-500/10">
                <p className="font-semibold">
                  {step >= 2 ? "✓ " : ""}Routing through Morph
                </p>

                <p className="text-sm text-gray-400">
                  Fast low-cost settlement.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-green-500 bg-green-500/10">
                <p className="font-semibold">
                  {step >= 3 ? "✓ " : ""}Settlement Complete
                </p>

                <p className="text-sm text-gray-400">
                  Funds delivered successfully.
                </p>
              </div>

              <div className="bg-[#0B1020] p-4 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-400">
                  Transaction Hash
                </p>

                <p className="text-green-400 break-all mt-2 text-sm">
                  0x7fa29bc8d2a91ef8c5d11f
                </p>
              </div>

            </div>
          </div>

          {/* Receiver */}
          <div className="bg-[#151B2E] p-6 rounded-3xl border border-gray-800">

            <h2 className="text-2xl font-bold mb-6 text-green-300">
              Receiver Wallet
            </h2>

            <div className="bg-[#0B1020] p-6 rounded-2xl border border-gray-700">

              <p className="text-gray-400 text-sm">
                Recipient
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {recipient}
              </h3>

              <div className="mt-8">

                <p className="text-gray-400 text-sm">
                  Balance
                </p>

                <h1 className="text-5xl font-bold mt-2 text-green-400">
                  {received
  ? `+ ₱${(amount * exchangeRates[country]).toLocaleString()} received`
  : "Waiting for transfer..."}
                </h1>

              </div>
            </div>

            <div className="mt-6">

              {received ? (
  <div className="bg-green-500/10 border border-green-500 rounded-2xl p-4">
    <p className="font-bold text-green-400">
      + ₱{(amount * exchangeRates[country]).toLocaleString()} received
    </p>

    <p className="text-sm text-gray-300 mt-1">
      Transfer received from {recipient}
    </p>
  </div>
) : (
  <div className="bg-[#0B1020] border border-gray-700 rounded-2xl p-4">
    <p className="text-gray-400">
      Waiting for transfer...
    </p>
  </div>
)}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}