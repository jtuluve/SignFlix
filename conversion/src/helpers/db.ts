import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});


export async function getVideoInfoFromDb(videoId: string): Promise<{ captionUrl: string }> {
  const query = `
    SELECT caption_url
    FROM videos
    WHERE id = $1
    LIMIT 1;
  `;

  try {
    const result = await pool.query(query, [videoId]);

    if (result.rows.length === 0) {
      throw new Error(`Video with id ${videoId} not found`);
    }

    return { captionUrl: result.rows[0].caption_url };
  } catch (err) {
    console.error("DB error in getVideoInfoFromDb:", err);
    throw err;
  }
}

export async function saveResultToDb(videoId: string, videoUrl: string, timingJsonUrl: string): Promise<void> {
  const query = `
    UPDATE videos
    SET final_video_url = $2,
        timing_json_url = $3,
        status = 'processed',
        processed_at = now()
    WHERE id = $1
  `;
  const client = await pool.connect();
  try {
    const res = await client.query(query, [videoId, videoUrl, timingJsonUrl]);
    if (res.rowCount === 0) {
      // optionally INSERT instead of update
      await client.query(
        `INSERT INTO videos (id, final_video_url, timing_json_url, status, processed_at) VALUES ($1,$2,$3,'processed',now())`,
        [videoId, videoUrl, timingJsonUrl]
      );
    }
  } finally {
    client.release();
  }
}