import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import LoginForm from "@/components/ui/LoginForm";
import Link from "next/link";
export default function Unauthorized() {
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-screen top-0 left-0"></div>
        <div className="z-10 p-8 bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 rounded-lg border border-[#684095] border-3 backdrop-blur-md flex flex-col gap-4 items-center">
          <h1 className="text-5xl text-white font-impact">Unauthorized</h1>
          <p className="text-white text-xl w-[80%] text-center">
            You do not have permission to access this page. Please log in with
            the appropriate credentials.
          </p>
          <Link href="/" className="text-black font-extralight font-impact hover:bg-[#5db4d6] transition-colors text-xl bg-[#78CCEE] p-2 rounded-lg border-2 border-black">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
