import { useState, useEffect } from 'react'
import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Web3Storage } from 'web3.storage'

export default function Home() {
  const [wallet, setWallet] = useState(null)
  const [connection, setConnection] = useState(null)
  const [nfts, setNfts] = useState([])
  const [minting, setMinting] = useState(false)

  useEffect(() => {
    const conn = new Connection(clusterApiUrl('devnet'), 'confirmed')
    setConnection(conn)
  }, [])

  const connectWallet = async () => {
    if (!window.solana) {
      alert('Phantom Wallet yükleyin!')
      return
    }

    try {
      const resp = await window.solana.connect()
      setWallet(window.solana)
      
      // SOL bakiyesi kontrol et
      const balance = await connection.getBalance(resp.publicKey)
      if (balance < 0.1 * LAMPORTS_PER_SOL) {
        alert('Devnet SOL gerekli! Faucet\'ten alın: https://faucet.solana.com')
      }
    } catch (err) {
      console.error('Wallet bağlantı hatası:', err)
    }
  }

  const mintNFT = async () => {
    if (!wallet) return

    setMinting(true)
    try {
      const name = document.getElementById('nftName').value
      const description = document.getElementById('nftDescription').value
      const file = document.getElementById('nftImage').files[0]

      if (!file) {
        alert('Görsel seçin!')
        return
      }

      // IPFS'e yükle
      const client = new Web3Storage({ 
        token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY 
      })
      
      const cid = await client.put([file])
      const imageUrl = `https://w3s.link/ipfs/${cid}/${file.name}`

      // Metadata oluştur
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: []
      }

      const metadataFile = new File(
        [JSON.stringify(metadata)], 
        'metadata.json', 
        { type: 'application/json' }
      )
      
      const metadataCid = await client.put([metadataFile])
      const metadataUrl = `https://w3s.link/ipfs/${metadataCid}/metadata.json`

      // Basit NFT kayıt (gerçek mint için Metaplex gerekli)
      const newNFT = {
        id: Date.now(),
        name,
        description,
        image: imageUrl,
        metadata: metadataUrl,
        owner: wallet.publicKey.toString(),
        createdAt: new Date().toISOString()
      }

      setNfts([...nfts, newNFT])
      alert('✅ NFT oluşturuldu! (Metadata IPFS\'te)')

    } catch (err) {
      console.error('Mint hatası:', err)
      alert('Hata: ' + err.message)
    } finally {
      setMinting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🚀 Devnet NFT Marketplace
        </h1>

        {/* Wallet Bağlantısı */}
        <div className="mb-8 text-center">
          {!wallet ? (
            <button 
              onClick={connectWallet}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
            >
              Phantom Wallet Bağla
            </button>
          ) : (
            <div className="bg-green-800 p-4 rounded-lg">
              ✅ Bağlandı: {wallet.publicKey.toString().slice(0,8)}...
            </div>
          )}
        </div>

        {wallet && (
          <>
            {/* NFT Oluşturma */}
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4">🎨 NFT Oluştur</h2>
              
              <div className="space-y-4">
                <input
                  id="nftName"
                  type="text"
                  placeholder="NFT Adı"
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600"
                />
                
                <textarea
                  id="nftDescription"
                  placeholder="Açıklama"
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 h-24"
                />
                
                <input
                  id="nftImage"
                  type="file"
                  accept="image/*"
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600"
                />
                
                <button
                  onClick={mintNFT}
                  disabled={minting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-semibold"
                >
                  {minting ? '⏳ Oluşturuluyor...' : '🚀 NFT Oluştur (Devnet)'}
                </button>
              </div>
            </div>

            {/* NFT Koleksiyonu */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">🖼️ NFT Koleksiyonum ({nfts.length})</h2>
              
              {nfts.length === 0 ? (
                <p className="text-gray-400">Henüz NFT oluşturmadınız.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nfts.map(nft => (
                    <div key={nft.id} className="bg-gray-700 p-4 rounded">
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                      <h3 className="font-bold">{nft.name}</h3>
                      <p className="text-sm text-gray-300">{nft.description}</p>
                      <a 
                        href={nft.metadata} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-xs hover:underline"
                      >
                        📋 IPFS Metadata
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Bilgilendirme */}
        <div className="mt-8 bg-blue-900 p-4 rounded-lg">
          <h3 className="font-bold mb-2">ℹ️ Devnet Bilgileri:</h3>
          <ul className="text-sm space-y-1">
            <li>• Test network - gerçek para harcanmaz</li>
            <li>• SOL lazımsa: <a href="https://faucet.solana.com" className="text-blue-300">faucet.solana.com</a></li>
            <li>• Phantom Wallet'ta "Devnet" seçili olmalı</li>
            <li>• NFT görselleri IPFS'e gerçek yüklenir</li>
          </ul>
        </div>
      </div>
    </div>
  )
}