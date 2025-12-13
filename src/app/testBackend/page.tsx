'use client'
import { addTradingPointToUser } from "@/features/trading/service";

export default function Home() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <button onClick={()=>{addTradingPointToUser("cmj3ubz5h0000gwhna2vdujz", -100)}}>Add point to user cmj3ubz5h0000gwhna2vdujzi</button>
    </div>
  );
}
