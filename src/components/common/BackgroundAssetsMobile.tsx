import React from 'react'
import Image from 'next/image'
export default function BackgroundAssetsMobile() {
  return (
    <div className="w-full h-full absolute flex flex-col gap-4 justify-center items-center md:hidden">
    <Image
          src={"/assets/clock-tower.svg"}
          className="w-full h-auto absolute bottom-[-10%] right-[-30%]"
          alt="eternity-clock-tower"
          draggable={false}
          width={1920}
          height={1080}
        ></Image>
        <Image
          src={"/assets/mobile-library.svg"}
          className="w-full h-auto absolute bottom-0"
          alt="eternity-library"
          draggable={false}
          width={1920}
          height={1080}
        ></Image>
        <Image
          src={"/assets/megaphone.svg"}
          className="w-1/2 h-auto absolute top-0 left-0"
          alt="eternity-megaphone"
          draggable={false}
          width={1920}
          height={1080}
        ></Image>

        <Image
          src={"/assets/mobile-podium.svg"}
          className="w-full h-auto absolute z-2 bottom-0"
          alt="eternity-podium"
          draggable={false}
          width={1920}
          height={1080}
        ></Image>
    </div>
  )
}
