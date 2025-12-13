import React from "react";
import Image from "next/image";
export default function BackgroundAssetsDesktop() {
  return (
    <div className="w-full h-full absolute hidden md:flex flex-col gap-4 justify-center items-center">
      <Image
        src={"/assets/mountains.svg"}
        className="w-full h-auto absolute bottom-0"
        alt="eternity-mountains"
        draggable={false}
        width={1920}
        height={1080}
      ></Image>
      <Image
        src={"/assets/megaphone.svg"}
        className="w-[20rem] h-auto absolute left-0 top-0"
        alt="eternity-megaphone"
        draggable={false}
        width={1920}
        height={1080}
      ></Image>
      <Image
        src={"/assets/clock-tower.svg"}
        className="w-[30rem] h-auto absolute right-25 bottom-0"
        alt="eternity-clock-tower"
        draggable={false}
        width={1920}
        height={1080}
      ></Image>
      <Image
        src={"/assets/library.svg"}
        className="w-full h-auto absolute bottom-0"
        alt="eternity-library"
        draggable={false}
        width={1920}
        height={1080}
      ></Image>
      <Image
        src={"/assets/bush.svg"}
        className="w-[30rem] h-auto absolute z-1 right-0 bottom-0"
        alt="eternity-bush"
        draggable={false}
        width={1920}
        height={1080}
      ></Image>
      <Image
        src={"/assets/podium.svg"}
        className="w-full h-auto absolute z-2 bottom-0"
        alt="eternity-podium"
        draggable={false}
        width={1920}
        height={1080}
      ></Image>
    </div>
  );
}
