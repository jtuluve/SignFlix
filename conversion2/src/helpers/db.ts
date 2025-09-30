import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});


export async function getVideoInfoFromDb(videoId: string): Promise<{ captionUrl: string }> {
  const query = `
    SELECT "captionUrl"
    FROM "Video"
    WHERE id = $1
    LIMIT 1;
  `;

  try {
    const result = await pool.query(query, [videoId]);

    if (result.rows.length === 0) {
      throw new Error(`Video with id ${videoId} not found`);
    }

    return { captionUrl: result.rows[0].captionUrl };
  } catch (err) {
    console.error("DB error in getVideoInfoFromDb:", err);
    throw err;
  }
}

export async function saveResultToDb(videoId: string, poseSequenceJsonUrl: string): Promise<void> {
  const query = `
    UPDATE "Video"
    SET "signTimeUrl" = $2
    WHERE id = $1
  `;
  const client = await pool.connect();
  try {
    const res = await client.query(query, [videoId, poseSequenceJsonUrl]);
    if (res.rowCount === 0) {
      throw new Error(`Video with id ${videoId} not found for update`);
    }
  } finally {
    client.release();
  }
}

export async function updateVideoPublishedStatus(videoId: string, status: boolean): Promise<void> {
  const query = `
    UPDATE "Video"
    SET "isPublished" = $2
    WHERE id = $1
  `;
  const client = await pool.connect();
  try {
    const res = await client.query(query, [videoId, status]);
    if (res.rowCount === 0) {
      throw new Error(`Video with id ${videoId} not found for status update`);
    }
  } finally {
    client.release();
  }
}