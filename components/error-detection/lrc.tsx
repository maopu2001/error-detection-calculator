"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SenderResult = {
  blocks: string[];
  columnSteps: string[];
  lrcBinary: string;
  finalOutput: string;
};

type ReceiverResult = {
  blocks: string[];
  steps: string[];
  isValid: boolean;
};

export default function LRC() {
  const [senderInput, setSenderInput] = useState("");
  const [receiverInput, setReceiverInput] = useState("");
  const [blockSize, setBlockSize] = useState("8");
  const [senderResult, setSenderResult] = useState<SenderResult | null>(null);
  const [receiverResult, setReceiverResult] = useState<ReceiverResult | null>(
    null
  );

  const validateBinaryInput = (value: string): boolean => {
    return /^[01\s\n]+$/.test(value);
  };

  const calculateLRC = () => {
    if (!senderInput.trim()) return;

    const cleanInput = senderInput.replace(/[\s\n]/g, "");

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
    for (let i = 0; i < cleanInput.length; i += size) {
      blocks.push(cleanInput.slice(i, i + size).padEnd(size, "0"));
    }

    const columnSteps: string[] = [];

    columnSteps.push("Step 1: Arrange the data in rows (each row = one block)");
    blocks.forEach((block, idx) => {
      columnSteps.push(`Row ${idx + 1}: ${block}`);
    });

    columnSteps.push("\nStep 2: Add all bits in each column (vertically)");

    const lrcBits: string[] = [];

    for (let col = 0; col < size; col++) {
      columnSteps.push(`\nColumn ${col + 1}:`);
      let onesCount = 0;
      const columnBits: string[] = [];

      blocks.forEach((block, rowIdx) => {
        const bit = block[col] || "0";
        columnBits.push(bit);
        if (bit === "1") onesCount++;
        columnSteps.push(`  Row ${rowIdx + 1}: ${bit}`);
      });

      columnSteps.push(`  Total 1s: ${onesCount}`);

      const lrcBit = onesCount % 2 === 0 ? "0" : "1";
      if (onesCount % 2 === 0) {
        columnSteps.push(`  Number of 1s is even → LRC bit = 0`);
      } else {
        columnSteps.push(`  Number of 1s is odd → LRC bit = 1`);
      }

      lrcBits.push(lrcBit);
    }

    const lrcBinary = lrcBits.join("");

    columnSteps.push("\nStep 3: The resulting bits form the LRC byte");
    columnSteps.push(`LRC: ${lrcBinary}`);

    columnSteps.push("\nStep 4: This LRC byte is sent along with data");

    const finalOutput = blocks.join("") + lrcBinary;

    columnSteps.push(`Data blocks: ${blocks.join(" ")}`);
    columnSteps.push(`LRC: ${lrcBinary}`);
    columnSteps.push(`✅ Transmitted: ${finalOutput}`);

    setSenderResult({
      blocks,
      columnSteps,
      lrcBinary,
      finalOutput,
    });

    setReceiverInput(finalOutput);
  };

  const verifyLRC = () => {
    if (!receiverInput.trim()) return;

    const cleanInput = receiverInput.replace(/[\s\n]/g, "");

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
    for (let i = 0; i < cleanInput.length; i += size) {
      blocks.push(cleanInput.slice(i, i + size).padEnd(size, "0"));
    }

    const steps: string[] = [];

    steps.push("Receiver Side Verification:");
    steps.push("\nStep 1: Arrange received data in rows (including LRC)");
    blocks.forEach((block, idx) => {
      if (idx === blocks.length - 1) {
        steps.push(`LRC row: ${block}`);
      } else {
        steps.push(`Row ${idx + 1}: ${block}`);
      }
    });

    steps.push("\nStep 2: Perform column-wise check (including LRC)");

    let allValid = true;

    for (let col = 0; col < size; col++) {
      steps.push(`\nColumn ${col + 1}:`);
      let onesCount = 0;

      blocks.forEach((block, rowIdx) => {
        const bit = block[col] || "0";
        if (bit === "1") onesCount++;
        if (rowIdx === blocks.length - 1) {
          steps.push(`  LRC: ${bit}`);
        } else {
          steps.push(`  Row ${rowIdx + 1}: ${bit}`);
        }
      });

      steps.push(`  Total 1s (including LRC): ${onesCount}`);

      if (onesCount % 2 === 0) {
        steps.push(`  ✅ Even number of 1s - Column OK`);
      } else {
        steps.push(`  ❌ Odd number of 1s - Error in this column`);
        allValid = false;
      }
    }

    steps.push("\nStep 3: Final verification");
    if (allValid) {
      steps.push("✅ All column sums are even - Data is error-free!");
    } else {
      steps.push("❌ Some column sums are odd - Error detected!");
    }

    setReceiverResult({
      blocks,
      steps,
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
            <Label htmlFor="lrc-input">Binary Input</Label>
            <Input
              id="lrc-input"
              placeholder="Enter binary data (e.g., 10101010&#10;11001100&#10;10010010)"
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

          <Button onClick={calculateLRC} className="w-full">
            Calculate LRC
          </Button>

          {senderResult && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-semibold mb-3">
                  Calculation Process:
                </p>
                <div className="rounded bg-background p-3 space-y-1 max-h-96 overflow-y-auto">
                  {senderResult.columnSteps.map((step, idx) => (
                    <p
                      key={idx}
                      className="font-mono text-sm whitespace-pre-wrap"
                    >
                      {step}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t space-y-3">
                <div>
                  <p className="text-sm font-semibold">LRC (Binary):</p>
                  <p className="mt-1 font-mono text-sm bg-background p-3 rounded">
                    {senderResult.lrcBinary}
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
              placeholder="Enter received data with LRC"
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

          <Button onClick={verifyLRC} className="w-full">
            Verify LRC
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
                      className="font-mono text-sm whitespace-pre-wrap"
                    >
                      {step}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
