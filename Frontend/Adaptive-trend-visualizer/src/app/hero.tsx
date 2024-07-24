"use client";

import Image from "next/image";
import { Button, Typography } from "@material-tailwind/react";
import ParentComponent from "@/components/ParentComponent";


function Hero() {
  return (
    <div className="relative min-h-screen w-full">
      <header className="grid !min-h-[20rem] bg-gray-900 px-8">
        <Image
          width={354}
          height={55}
          src="/image/logo.png"
          alt="Office"
          className="col-span-1 m-5  "
        />
        <div className="container mx-auto mt-29 grid h-full w-full grid-cols-1 place-items-center lg:mt-14 lg:grid-cols-2">

          <div className="col-span-1">
            <Typography variant="h1" color="white" className="mb-14">
              Adaptive Trend Visualizer
            </Typography>


          </div>

        </div>
      </header>
      <div className="mx-8 lg:mx-16 -mt-4 rounded-xl bg-white p-5 md:p-14 shadow-md">
        <ParentComponent />

      </div>
    </div>
  );
}
export default Hero;
