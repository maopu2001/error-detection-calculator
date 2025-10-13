"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ParityBit from "@/components/error-detection/parity-bit";
import Checksum from "@/components/error-detection/checksum";
import LRC from "@/components/error-detection/lrc";
import CRC from "@/components/error-detection/crc";
import { errorDetectionMethods } from "@/lib/errorDetectionMethods";

export default function ErrorDetectionCalculator() {
  let gridCols = "";
  if (errorDetectionMethods.length >= 4) gridCols = `grid-cols-4`;
  else if (errorDetectionMethods.length === 3) gridCols = `grid-cols-3`;
  else if (errorDetectionMethods.length === 2) gridCols = `grid-cols-2`;
  else gridCols = `grid-cols-1`;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Error Detection Calculator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Calculate different error detection methods for data transmission
          </p>
        </div>

        <Tabs defaultValue="parity" className="w-full">
          <TabsList className={`grid w-full ${gridCols}`}>
            {errorDetectionMethods.map((method) => (
              <TabsTrigger key={method.value} value={method.value}>
                {method.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="parity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Parity Bit</CardTitle>
                <CardDescription>
                  Adds a single bit to make the total number of 1s even or odd
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ParityBit />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checksum" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Checksum</CardTitle>
                <CardDescription>
                  Sum of data bytes, used to detect errors in data communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Checksum />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lrc" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>LRC (Longitudinal Redundancy Check)</CardTitle>
                <CardDescription>
                  XOR of all data bytes to detect errors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LRC />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crc" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>CRC (Cyclic Redundancy Check)</CardTitle>
                <CardDescription>
                  Polynomial division-based error detection method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CRC />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
