import formidable from 'formidable';
import fs from 'fs';
import { NFTStorage, File } from 'nft.storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(400).json({ error: 'Dosya okunamadı.' });

    const fileData = Array.isArray(files.file) ? files.file[0] : files.file;
    const fileBuffer = fs.readFileSync(fileData.filepath);
    const fileName = fileData.originalFilename || 'image.png';

    const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN });
    const cid = await client.storeBlob(new File([fileBuffer], fileName));
    res.status(200).json({ cid });
  });
}