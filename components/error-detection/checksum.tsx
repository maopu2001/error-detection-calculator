"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SenderResult = {
  blocks: string[];
  sum: string;
  checksum: string;
  steps: string[];
  finalOutput: string;
};

type ReceiverResult = {
  blocks: string[];
  steps: string[];
  sum: string;
  isValid: boolean;
};

export default function Checksum() {
  const [senderInput, setSenderInput] = useState("");
  const [receiverInput, setReceiverInput] = useState("");
  const [blockSize, setBlockSize] = useState("8");
  const [senderResult, setSenderResult] = useState<SenderResult | null>(null);
  const [receiverResult, setReceiverResult] = useState<ReceiverResult | null>(
    null
  );

  const validateBinaryInput = (value: string): boolean => {
    return /^[01]+$/.test(value);
  };

  const addBinary = (
    a: string,
    b: string,
    size: number
  ): { result: string; carry: string; steps: string[] } => {
    const steps: string[] = [];
    const num1 = Number.parseInt(a, 2);
    const num2 = Number.parseInt(b, 2);
    let sum = num1 + num2;

    const maxValue = Math.pow(2, size);

    if (sum >= maxValue) {
      const carry = Math.floor(sum / maxValue);
      const carryBinary = carry.toString(2);
      const mainSum = sum % maxValue;
      const mainSumBinary = mainSum.toString(2).padStart(size, "0");

      steps.push(`  ${a}`);
      steps.push(`+ ${b}`);
      steps.push(`${"=".padStart(size + 2, "-")}`);
      steps.push(`  ${sum.toString(2).padStart(size + 1, "0")} (overflow)`);
      steps.push(`  Carry: ${carryBinary}`);
      steps.push(`  Wrap around: ${mainSumBinary} + ${carryBinary}`);

      sum = mainSum + carry;
      const finalBinary = sum.toString(2).padStart(size, "0");
      steps.push(`  Result: ${finalBinary}`);

      return { result: finalBinary, carry: carryBinary, steps };
    } else {
      const resultBinary = sum.toString(2).padStart(size, "0");
      steps.push(`  ${a}`);
      steps.push(`+ ${b}`);
      steps.push(`${"=".padStart(size + 2, "-")}`);
      steps.push(`  ${resultBinary}`);
      return { result: resultBinary, carry: "0", steps };
    }
  };

  const calculateChecksum = () => {
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
      blocks.push(senderInput.slice(i, i + size).padEnd(size, "0"));
    }

    const steps: string[] = [];

    steps.push("Step 1: Divide the data into equal-sized blocks");
    blocks.forEach((block, idx) => {
      steps.push(`Block ${idx + 1}: ${block}`);
    });

    steps.push("\nStep 2: Add all blocks together (binary addition)");

    let currentSum = blocks[0];
    steps.push(`Start with Block 1: ${currentSum}`);

    for (let i = 1; i < blocks.length; i++) {
      steps.push(`\nAdding Block ${i + 1}:`);
      const addResult = addBinary(currentSum, blocks[i], size);
      steps.push(...addResult.steps);
      currentSum = addResult.result;
    }

    steps.push(`\nSum after adding all blocks: ${currentSum}`);

    steps.push("\nStep 3: Take the 1's complement (flip all bits)");
    const sumValue = Number.parseInt(currentSum, 2);
    const maxValue = Math.pow(2, size) - 1;
    const onesComplement = (sumValue ^ maxValue)
      .toString(2)
      .padStart(size, "0");

    steps.push(`Sum:             ${currentSum}`);
    steps.push(`1's complement:  ${onesComplement}`);
    steps.push("\nThis is the checksum!");

    const finalOutput = blocks.join("") + onesComplement;

    steps.push("\nStep 4: Send data + checksum together");
    steps.push(`Data blocks: ${blocks.join(" ")}`);
    steps.push(`Checksum: ${onesComplement}`);
    steps.push(`✅ Transmitted: ${finalOutput}`);

    setSenderResult({
      blocks,
      sum: currentSum,
      checksum: onesComplement,
      steps,
      finalOutput,
    });

    setReceiverInput(finalOutput);
  };

  const verifyChecksum = () => {
    if (!receiverInput.trim()) return;

    if (!validateBinaryInput(receiverInput)) {
      alert("Please enter only binary digits (0 and 1)");
      return;
    }

    const size = Number.parseInt(blockSize);
    if (isNaN(size) || size <= 0) {
      alert("Please enter a valid block size");
      return;
    }

    const blocks: string[] = [];
    for (let i = 0; i < receiverInput.length; i += size) {
      blocks.push(receiverInput.slice(i, i + size).padEnd(size, "0"));
    }

    const steps: string[] = [];

    steps.push("Receiver Side Verification:");
    steps.push("\nStep 1: Divide received data into blocks");
    blocks.forEach((block, idx) => {
      steps.push(`Block ${idx + 1}: ${block}`);
    });

    steps.push("\nStep 2: Add all blocks together (including checksum)");

    let currentSum = blocks[0];
    steps.push(`Start with Block 1: ${currentSum}`);

    for (let i = 1; i < blocks.length; i++) {
      steps.push(`\nAdding Block ${i + 1}:`);
      const addResult = addBinary(currentSum, blocks[i], size);
      steps.push(...addResult.steps);
      currentSum = addResult.result;
    }

    steps.push(`\nFinal sum: ${currentSum}`);

    steps.push("\nStep 3: Check if result is all 1s");
    const maxValue = Math.pow(2, size) - 1;
    const allOnes = maxValue.toString(2).padStart(size, "0");
    steps.push(`Expected (all 1s): ${allOnes}`);
    steps.push(`Received sum:      ${currentSum}`);

    const isValid = currentSum === allOnes;

    if (isValid) {
      steps.push("\n✅ Sum is all 1s - No error detected!");
    } else {
      steps.push("\n❌ Sum is not all 1s - Error detected!");
    }

    setReceiverResult({
      blocks,
      steps,
      sum: currentSum,
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
            <Label htmlFor="checksum-input">Binary Input</Label>
            <Input
              id="checksum-input"
              placeholder="Enter binary data (e.g., 10101001 00111010 11001100)"
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

          <Button onClick={calculateChecksum} className="w-full">
            Calculate Checksum
          </Button>

          {senderResult && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-semibold mb-3">
                  Calculation Process:
                </p>
                <div className="space-y-1 rounded bg-background p-3 max-h-96 overflow-y-auto">
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
                  <p className="text-sm font-semibold">Sum (Binary):</p>
                  <p className="mt-1 font-mono text-sm bg-background p-3 rounded">
                    {senderResult.sum}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Checksum (Binary):</p>
                  <p className="mt-1 font-mono text-sm bg-background p-3 rounded">
                    {senderResult.checksum}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Data to Send (Binary):
                  </p>
                  <p className="mt-1 break-all font-mono text-sm bg-background p-3 rounded font-bold text-primary">
                    {senderResult.finalOutput}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✅ This data is sent to the receiver
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
              placeholder="Enter received data with checksum"
              value={receiverInput}
              onChange={(e) => setReceiverInput(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Default: Output from sender side
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver-block-size">Block Size (bits)</Label>
            <Input
              id="receiver-block-size"
              type="number"
              value={blockSize}
              readOnly
              className="bg-muted"
            />
          </div>

          <Button onClick={verifyChecksum} className="w-full">
            Verify Checksum
          </Button>

          {receiverResult && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-semibold mb-3">
                  Verification Process:
                </p>
                <div className="space-y-1 rounded bg-background p-3 max-h-96 overflow-y-auto">
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
                  <p className="text-sm font-semibold">Final Sum (Binary):</p>
                  <p className="mt-1 font-mono text-sm bg-background p-3 rounded">
                    {receiverResult.sum}
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
