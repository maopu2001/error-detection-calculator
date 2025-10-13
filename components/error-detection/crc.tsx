"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SenderResult = {
  data: string;
  polynomial: string;
  appendedData: string;
  steps: string[];
  remainder: string;
  crcCode: string;
};

type ReceiverResult = {
  receivedData: string;
  polynomial: string;
  steps: string[];
  remainder: string;
  isValid: boolean;
};

export default function CRC() {
  const [senderInput, setSenderInput] = useState("");
  const [polynomial, setPolynomial] = useState("10011");
  const [receiverInput, setReceiverInput] = useState("");
  const [senderResult, setSenderResult] = useState<SenderResult | null>(null);
  const [receiverResult, setReceiverResult] = useState<ReceiverResult | null>(
    null
  );

  const validateBinaryInput = (value: string): boolean => {
    return /^[01]+$/.test(value);
  };

  const xorDivision = (
    dividend: string,
    divisor: string
  ): { steps: string[]; remainder: string } => {
    const steps: string[] = [];
    let temp = dividend;
    const divisorLen = divisor.length;

    steps.push("Binary Division (using XOR):");
    steps.push(`Dividend: ${temp}`);
    steps.push(`Divisor:  ${divisor}`);
    steps.push("");

    let pos = 0;
    while (pos <= temp.length - divisorLen) {
      if (temp[pos] === "1") {
        steps.push(`Step ${steps.length - 2}:`);
        steps.push(
          `  ${temp.substring(0, pos)}[${temp.substring(
            pos,
            pos + divisorLen
          )}]${temp.substring(pos + divisorLen)}`
        );
        steps.push(`  XOR with ${divisor}`);

        let xorResult = "";
        for (let i = 0; i < divisorLen; i++) {
          xorResult += temp[pos + i] === divisor[i] ? "0" : "1";
        }

        temp =
          temp.substring(0, pos) + xorResult + temp.substring(pos + divisorLen);
        steps.push(`  Result: ${temp}`);
        steps.push("");
      }
      pos++;
    }

    const remainder = temp.substring(temp.length - (divisorLen - 1));
    steps.push(`Final Remainder: ${remainder}`);

    return { steps, remainder };
  };

  const calculateSenderCRC = () => {
    if (!senderInput.trim() || !polynomial.trim()) return;

    if (!validateBinaryInput(senderInput) || !validateBinaryInput(polynomial)) {
      alert("Please enter only binary digits (0 and 1)");
      return;
    }

    if (polynomial[0] !== "1") {
      alert("Polynomial must start with 1");
      return;
    }

    const steps: string[] = [];

    steps.push("Step 1: Take your data bits");
    steps.push(`Data: ${senderInput}`);
    steps.push("");

    steps.push("Step 2: Choose a generator polynomial (divisor)");
    steps.push(`Polynomial: ${polynomial}`);
    steps.push(`Polynomial length: ${polynomial.length} bits`);
    steps.push("");

    const zerosToAppend = polynomial.length - 1;
    const appendedData = senderInput + "0".repeat(zerosToAppend);

    steps.push(`Step 3: Append (n-1) zeros to the end of data`);
    steps.push(`where n = ${polynomial.length} (number of bits in polynomial)`);
    steps.push(
      `Appended data: ${senderInput} + ${"0".repeat(
        zerosToAppend
      )} = ${appendedData}`
    );
    steps.push("");

    steps.push(
      "Step 4: Divide (binary division) the new data by the polynomial"
    );
    steps.push("Use XOR for subtraction, keep only the remainder");
    steps.push("");

    const divisionResult = xorDivision(appendedData, polynomial);
    steps.push(...divisionResult.steps);
    steps.push("");

    const crcCode = senderInput + divisionResult.remainder;
    steps.push("Step 5: Append the remainder to the original data");
    steps.push(`Original data: ${senderInput}`);
    steps.push(`Remainder (CRC): ${divisionResult.remainder}`);
    steps.push(`CRC Code: ${crcCode}`);
    steps.push("");
    steps.push("✅ This CRC code is sent to the receiver");

    setSenderResult({
      data: senderInput,
      polynomial,
      appendedData,
      steps,
      remainder: divisionResult.remainder,
      crcCode,
    });

    setReceiverInput(crcCode);
  };

  const calculateReceiverCRC = () => {
    if (!receiverInput.trim() || !polynomial.trim()) return;

    if (
      !validateBinaryInput(receiverInput) ||
      !validateBinaryInput(polynomial)
    ) {
      alert("Please enter only binary digits (0 and 1)");
      return;
    }

    if (polynomial[0] !== "1") {
      alert("Polynomial must start with 1");
      return;
    }

    const steps: string[] = [];

    steps.push("Receiver Side:");
    steps.push("");
    steps.push("Step 1: Receive the data");
    steps.push(`Received data: ${receiverInput}`);
    steps.push("");

    steps.push("Step 2: Divide the received bits by the same polynomial");
    steps.push(`Polynomial: ${polynomial}`);
    steps.push("");

    const divisionResult = xorDivision(receiverInput, polynomial);
    steps.push(...divisionResult.steps);
    steps.push("");

    const isValid =
      divisionResult.remainder === "0".repeat(polynomial.length - 1);

    steps.push("Step 3: Check the remainder");
    if (isValid) {
      steps.push(
        `Remainder = ${"0".repeat(polynomial.length - 1)} (all zeros)`
      );
      steps.push("✅ Data is error-free!");
    } else {
      steps.push(`Remainder = ${divisionResult.remainder} (not all zeros)`);
      steps.push("❌ Error detected!");
    }

    setReceiverResult({
      receivedData: receiverInput,
      polynomial,
      steps,
      remainder: divisionResult.remainder,
      isValid,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sender" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sender">Sender Side</TabsTrigger>
          <TabsTrigger value="receiver">Receiver Side</TabsTrigger>
        </TabsList>

        <TabsContent value="sender" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sender-input">Binary Data</Label>
            <Input
              id="sender-input"
              placeholder="Enter binary data (e.g., 1101011011)"
              value={senderInput}
              onChange={(e) => setSenderInput(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="polynomial">Generator Polynomial (Binary)</Label>
            <Input
              id="polynomial"
              placeholder="Enter polynomial (e.g., 10011)"
              value={polynomial}
              onChange={(e) => setPolynomial(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Common: CRC-5 (110101), CRC-8 (100000111), CRC-16
              (11000000000000101)
            </p>
          </div>

          <Button onClick={calculateSenderCRC} className="w-full">
            Calculate CRC (Sender)
          </Button>

          {senderResult && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-semibold mb-3">
                  Calculation Process:
                </p>
                <div className="rounded bg-background p-3 space-y-1 max-h-96 overflow-y-auto">
                  {senderResult.steps.map((step, idx) => (
                    <p
                      key={idx}
                      className="text-sm font-mono whitespace-pre-wrap"
                    >
                      {step}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t space-y-3">
                <div>
                  <p className="text-sm font-semibold">
                    CRC Remainder (Binary):
                  </p>
                  <p className="mt-1 font-mono text-sm bg-background p-3 rounded">
                    {senderResult.remainder}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    CRC Code to Send (Binary):
                  </p>
                  <p className="mt-1 break-all font-mono text-sm bg-background p-3 rounded font-bold text-primary">
                    {senderResult.crcCode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="receiver" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="receiver-input">Received Binary Data</Label>
            <Input
              id="receiver-input"
              placeholder="Enter received data"
              value={receiverInput}
              onChange={(e) => setReceiverInput(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Default: Output from sender side
            </p>
          </div>

          <div className="space-y-2">
            <Label>Generator Polynomial (Binary)</Label>
            <Input
              value={polynomial}
              onChange={(e) => setPolynomial(e.target.value)}
              className="font-mono"
            />
          </div>

          <Button onClick={calculateReceiverCRC} className="w-full">
            Verify CRC (Receiver)
          </Button>

          {receiverResult && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-semibold mb-3">
                  Verification Process:
                </p>
                <div className="rounded bg-background p-3 space-y-1 max-h-96 overflow-y-auto">
                  {receiverResult.steps.map((step, idx) => (
                    <p
                      key={idx}
                      className="text-sm font-mono whitespace-pre-wrap"
                    >
                      {step}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t space-y-3">
                <div>
                  <p className="text-sm font-semibold">Remainder (Binary):</p>
                  <p className="mt-1 font-mono text-sm bg-background p-3 rounded">
                    {receiverResult.remainder}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Status:</p>
                  <p
                    className={`mt-1 font-mono text-sm bg-background p-3 rounded font-bold ${
                      receiverResult.isValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {receiverResult.isValid
                      ? "✅ No errors detected"
                      : "❌ Error detected"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
