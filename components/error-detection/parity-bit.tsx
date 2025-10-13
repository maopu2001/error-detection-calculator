"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SenderResult = {
  blocks: string[];
  calculations: {
    block: string;
    onesCount: number;
    parityBit: string;
    output: string;
    steps: string[];
  }[];
  finalOutput: string;
};

type ReceiverResult = {
  blocks: string[];
  verifications: {
    block: string;
    onesCount: number;
    expectedParity: string;
    isValid: boolean;
    steps: string[];
  }[];
  isValid: boolean;
};

export default function ParityBit() {
  const [senderInput, setSenderInput] = useState("");
  const [receiverInput, setReceiverInput] = useState("");
  const [blockSize, setBlockSize] = useState("8");
  const [parityType, setParityType] = useState<"even" | "odd">("even");
  const [senderResult, setSenderResult] = useState<SenderResult | null>(null);
  const [receiverResult, setReceiverResult] = useState<ReceiverResult | null>(
    null
  );

  const validateBinaryInput = (value: string): boolean => {
    return /^[01]+$/.test(value);
  };

  const calculateParity = () => {
    if (!senderInput.trim()) return;

    if (!validateBinaryInput(senderInput)) {
      alert("Please enter only binary digits (0 and 1)");
      return;
    }

    const size = Number.parseInt(blockSize);
    if (isNaN(size) || size <= 0) {
      alert("Please enter a valid block size");
      return;
    }

    const blocks: string[] = [];
    for (let i = 0; i < senderInput.length; i += size) {
      blocks.push(senderInput.slice(i, i + size));
    }

    const calculations = blocks.map((block) => {
      const steps: string[] = [];

      steps.push(`Step 1: Write down the data bits`);
      steps.push(`Data: ${block}`);

      steps.push(`\nStep 2: Count the number of 1s`);
      const onesCount = block.split("").filter((bit) => bit === "1").length;
      steps.push(`Number of 1s: ${onesCount}`);

      steps.push(`\nStep 3: Determine parity type`);
      steps.push(`Using: ${parityType} parity`);

      steps.push(`\nStep 4: Set the parity bit`);
      let parityBit: string;
      if (parityType === "even") {
        if (onesCount % 2 === 0) {
          parityBit = "0";
          steps.push(`Count of 1s (${onesCount}) is even → parity bit = 0`);
        } else {
          parityBit = "1";
          steps.push(`Count of 1s (${onesCount}) is odd → parity bit = 1`);
        }
      } else {
        if (onesCount % 2 === 0) {
          parityBit = "1";
          steps.push(`Count of 1s (${onesCount}) is even → parity bit = 1`);
        } else {
          parityBit = "0";
          steps.push(`Count of 1s (${onesCount}) is odd → parity bit = 0`);
        }
      }

      steps.push(`\nResult: ${block} + ${parityBit} = ${block}${parityBit}`);

      return {
        block,
        onesCount,
        parityBit,
        output: block + parityBit,
        steps,
      };
    });

    const finalOutput = calculations.map((c) => c.output).join("");

    setSenderResult({
      blocks,
      calculations,
      finalOutput,
    });

    setReceiverInput(finalOutput);
  };

  const verifyParity = () => {
    if (!receiverInput.trim()) return;

    if (!validateBinaryInput(receiverInput)) {
      alert("Please enter only binary digits (0 and 1)");
      return;
    }

    const size = Number.parseInt(blockSize) + 1; // +1 for parity bit
    if (isNaN(size) || size <= 1) {
      alert("Please enter a valid block size");
      return;
    }

    const blocks: string[] = [];
    for (let i = 0; i < receiverInput.length; i += size) {
      blocks.push(receiverInput.slice(i, i + size));
    }

    let allValid = true;

    const verifications = blocks.map((block) => {
      const steps: string[] = [];

      steps.push("Receiver Side Verification:");
      steps.push(`\nReceived block: ${block}`);

      const dataBits = block.slice(0, -1);
      const receivedParity = block.slice(-1);

      steps.push(`Data bits: ${dataBits}`);
      steps.push(`Received parity bit: ${receivedParity}`);

      steps.push(`\nCount the number of 1s in data bits`);
      const onesCount = dataBits.split("").filter((bit) => bit === "1").length;
      steps.push(`Number of 1s: ${onesCount}`);

      steps.push(`\nCalculate expected parity bit (${parityType} parity)`);
      let expectedParity: string;
      if (parityType === "even") {
        if (onesCount % 2 === 0) {
          expectedParity = "0";
          steps.push(
            `Count of 1s (${onesCount}) is even → expected parity = 0`
          );
        } else {
          expectedParity = "1";
          steps.push(`Count of 1s (${onesCount}) is odd → expected parity = 1`);
        }
      } else {
        if (onesCount % 2 === 0) {
          expectedParity = "1";
          steps.push(
            `Count of 1s (${onesCount}) is even → expected parity = 1`
          );
        } else {
          expectedParity = "0";
          steps.push(`Count of 1s (${onesCount}) is odd → expected parity = 0`);
        }
      }

      const isValid = expectedParity === receivedParity;

      steps.push(`\nComparison:`);
      steps.push(`Expected parity: ${expectedParity}`);
      steps.push(`Received parity: ${receivedParity}`);

      if (isValid) {
        steps.push(`✅ Match! No error detected in this block`);
      } else {
        steps.push(`❌ Mismatch! Error detected in this block`);
        allValid = false;
      }

      return {
        block,
        onesCount,
        expectedParity,
        isValid,
        steps,
      };
    });

    setReceiverResult({
      blocks,
      verifications,
      isValid: allValid,
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
            <Label htmlFor="parity-input">Binary Input</Label>
            <Input
              id="parity-input"
              placeholder="Enter binary data (e.g., 1011001)"
              value={senderInput}
              onChange={(e) => setSenderInput(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-size">Block Size (bits)</Label>
            <Input
              id="block-size"
              type="number"
              placeholder="8"
              value={blockSize}
              onChange={(e) => setBlockSize(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label>Parity Type</Label>
            <RadioGroup
              value={parityType}
              onValueChange={(v) => setParityType(v as "even" | "odd")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="even" id="even" />
                <Label htmlFor="even" className="font-normal">
                  Even Parity
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="odd" id="odd" />
                <Label htmlFor="odd" className="font-normal">
                  Odd Parity
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={calculateParity} className="w-full">
            Calculate Parity
          </Button>

          {senderResult && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-semibold mb-3">
                  Calculation Process:
                </p>
                {senderResult.calculations.map((calc, idx) => (
                  <div
                    key={idx}
                    className="mb-4 rounded bg-background p-3 space-y-1"
                  >
                    <p className="text-sm font-medium text-primary">
                      Block {idx + 1}:
                    </p>
                    {calc.steps.map((step, stepIdx) => (
                      <p
                        key={stepIdx}
                        className="font-mono text-sm whitespace-pre-wrap"
                      >
                        {step}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-semibold">Final Output (Binary):</p>
                <p className="mt-2 break-all font-mono text-sm bg-background p-3 rounded font-bold text-primary">
                  {senderResult.finalOutput}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ This data is sent to the receiver
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="receiver" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="receiver-input">Received Binary Data</Label>
            <Input
              id="receiver-input"
              placeholder="Enter received data with parity bits"
              value={receiverInput}
              onChange={(e) => setReceiverInput(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Default: Output from sender side
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver-block-size">
              Block Size (bits, without parity)
            </Label>
            <Input
              id="receiver-block-size"
              type="number"
              value={blockSize}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Parity Type</Label>
            <RadioGroup
              value={parityType}
              onValueChange={(v) => setParityType(v as "even" | "odd")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="even" id="even-receiver" />
                <Label htmlFor="even-receiver" className="font-normal">
                  Even Parity
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="odd" id="odd-receiver" />
                <Label htmlFor="odd-receiver" className="font-normal">
                  Odd Parity
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={verifyParity} className="w-full">
            Verify Parity
          </Button>

          {receiverResult && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-semibold mb-3">
                  Verification Process:
                </p>
                {receiverResult.verifications.map((verify, idx) => (
                  <div
                    key={idx}
                    className="mb-4 rounded bg-background p-3 space-y-1"
                  >
                    <p className="text-sm font-medium text-primary">
                      Block {idx + 1}:
                    </p>
                    {verify.steps.map((step, stepIdx) => (
                      <p
                        key={stepIdx}
                        className="font-mono text-sm whitespace-pre-wrap"
                      >
                        {step}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-semibold">Overall Status:</p>
                <p
                  className={`mt-2 font-mono text-sm bg-background p-3 rounded font-bold ${
                    receiverResult.isValid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {receiverResult.isValid
                    ? "✅ No errors detected"
                    : "❌ Error detected"}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
