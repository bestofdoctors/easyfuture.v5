import { useState } from 'react';

export default function Home() {
  const [cid, setCid] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    teslim: '',
    kira: '',
    file: null
  });

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setCid(data.cid);
    return data.cid;
  };

  const handleMint = async () => {
    const cid = await uploadFile(form.file);
    const metadata = {
      name: form.name,
      description: form.description,
      image: `ipfs://${cid}`,
      attributes: [
        { trait_type: 'Teslim', value: form.teslim },
        { trait_type: 'Kira Getirisi', value: form.kira }
      ]
    };
    console.log('Metadata:', metadata);
    alert('Mint fonksiyonu burada çağrılacak!');
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Emlak NFT Mint Et</h1>

      <input className="border p-2 w-full mb-2" placeholder="Ev Adı" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <textarea className="border p-2 w-full mb-2" placeholder="Açıklama" onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
      <input className="border p-2 w-full mb-2" placeholder="Teslim Yılı" onChange={(e) => setForm({ ...form, teslim: e.target.value })} />
      <input className="border p-2 w-full mb-2" placeholder="Yıllık Kira Getirisi" onChange={(e) => setForm({ ...form, kira: e.target.value })} />

      <input type="file" className="mb-2" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] })} />
      <button onClick={handleMint} className="bg-green-600 text-white py-2 px-4 rounded">Mint Et</button>

      {cid && <p className="mt-4 text-green-600">Yüklenen Görsel CID: {cid}</p>}
    </div>
  );
}