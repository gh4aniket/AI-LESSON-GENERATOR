"use client";
import { useState } from "react";
export default function AIcode() {
    const images=[/*list of text strings contianing url of images in "" seperated by comma */];
    const srcurl="/*url for video */";
    return(
    <div className="w-full flex justify-center px-4 py-8">
      <div className="w-full max-w-5xl">

        {/* Title – Full width on all screens */}
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-8">
           {/*title comes here */ }
        </h1>

        {/* 2-column layout ONLY on large screens */}
        <div className="flex flex-col lg:flex-row lg:gap-10 mb-12">

          {/* Description Section */}
          <section className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {/*description comes here */ }
            </p>
          </section>

          {/* Images Section */}
          <section className="w-full lg:w-1/2">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Images
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Lesson Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow"
                />
              ))}
            </div>
          </section>

        </div>

        {/* Video Section – Always on a new row */}
        { (
          <section className="w-full mb-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Video
            </h2>
            <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden shadow-md">
              <iframe
        width="853"
        height="480"
        src={srcurl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded YouTube Video"
      />
            </div>
          </section>
        )}
      </div>
    </div>

    );
}