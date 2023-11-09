import S3 from "aws-sdk/clients/s3";
import type { NextApiRequest, NextApiResponse } from "next";
import { generate as generateId } from "shortid";
import clientPromise from "../../lib/db";

// Check for mongodb connection string in environment variables
if (!process.env.MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Generate a friendly ID for this save request:
  const snapshotId = generateId();

  // Next.js automatically handles body parsing for `POST`, `PUT`, et al.
  const contents = req.body as { id: string; innerText: string }[];

  // Upload the user-provided data to S3 under the randomly generated ID.
  //
  // We're not worried about ID collisions, but a real application probably
  // should be!
  try {
    /*  await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${snapshotId}.json`,
        Body: JSON.stringify(contents),
      })
      .promise(); */

    const client = await clientPromise;
    const db = await client.db("radiant-light");
    const collection = await db.collection("contents");
    const result = await collection.insertOne({
      id: snapshotId,
      contents,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
    return res.end();
  }

  // Return the `snapshotId` so the frontend can generate a sharable link.
  res.status(200);
  res.json({ snapshotId });
  res.end();
};

export const config = {
  api: {
    bodyParser: { sizeLimit: "256kb" },
  },
};
