import React from "react";
import { Link } from "react-router-dom";
import Mapa from "../components/Mapa";

const TestPage = () => {
  return (
    <div className="relative min-h-screen w-full">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <svg
              className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al Inicio
          </Link>
          <div className="flex items-center space-x-4 text-gray-800">
            <div className="flex items-center space-x-3  px-4 py-2">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  SoftCluVRP
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Modo Prueba Interactivo
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="pt-24 h-screen w-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none z-10"></div>
        <div className="h-full w-full p-4">
          <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
            <Mapa />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPage;
