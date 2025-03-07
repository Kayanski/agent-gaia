"use client"

import { TGameState } from "@/lib/types";
import { createContext } from "react";

export const GameStateContext = createContext<TGameState | undefined>(undefined);
