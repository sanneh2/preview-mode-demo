import type { NextApiRequest, NextApiResponse } from "next";
import { generate as generateId } from "shortid";
import clientPromise from "../../lib/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Upload the user-provided data to S3 under the randomly generated ID.
  //
  // We're not worried about ID collisions, but a real application probably
  // should be!
  try {
    await res.unstable_revalidate("/");
    return res.json({ revalidated: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
    return res.end();
  }

  // Return the `snapshotId` so the frontend can generate a sharable link.
  res.status(200);
  res.end();
};
