import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ Importar useNavigate

export default function CameraCapture() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate(); // ✅ Inicializar navigate
    const [capturedImage, setCapturedImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pin, setPin] = useState('');
    const [pinValidated, setPinValidated] = useState(false);
    const [pinError, setPinError] = useState('');
    const [toggle, setToggle] = useState(false);

    const correctPin = '1234'; // Cambia el PIN correcto aquí

    useEffect(() => {
        if (pinValidated) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                })
                .catch(err => {
                    console.error("No se pudo acceder a la cámara:", err);
                });
        }
    }, [pinValidated]);

    const handlePinSubmit = () => {
        if (pin === correctPin) {
            setPinValidated(true);
            setPinError('');
        } else {
            setPinError('PIN incorrecto. Inténtalo de nuevo.');
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
    };

    const sendToBackend = async () => {
        if (!capturedImage) {
            alert("Primero captura una foto");
            return;
        }
        setLoading(true);
        try {
            const base64WithoutPrefix = capturedImage.split(',')[1];
            const response = await fetch('http://192.168.253.111:5000/compare-faces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64WithoutPrefix })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error al enviar al backend:", error);
        }
        setLoading(false);
    };

    const handleDashboardClick = () => {
        navigate('/dasbord');  // ✅ Redirigir a /dasbord
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Autenticacion</h1>

            {!pinValidated ? (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
                    <h2 className="text-xl font-semibold mb-4">Ingresa tu PIN</h2>
                    <input
                        type="password"
                        maxLength="4"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {pinError && <p className="text-red-500 mt-2">{pinError}</p>}
                    <button
                        onClick={handlePinSubmit}
                        className="bg-blue-600 hover:bg-blue-700 mt-4 w-full py-2 rounded shadow"
                    >
                        Validar PIN
                    </button>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <video ref={videoRef} className="rounded-lg shadow-lg w-80"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>

                    {capturedImage && (
                        <div className="mt-4">
                            <p className="text-center">Imagen capturada:</p>
                            <img src={capturedImage} alt="capturada" className="rounded-lg shadow-md w-80" />
                        </div>
                    )}

                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={capturePhoto}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                        >
                            Capturar Foto
                        </button>
                        <button
                            onClick={sendToBackend}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Procesar Imagen'}
                        </button>
                    </div>

                    {result && (
                        <div className="mt-6 bg-gray-800 p-4 rounded shadow w-full max-w-md">
                            <h2 className="font-bold text-lg mb-2">Resultado:</h2>
                            {result.match ? (
                                <>
                                    <p className="text-green-400">✔️ Coincidencia encontrada: {result.matched_image} (Similitud: {result.similarity.toFixed(2)}%)</p>
                                    
                                    {/* ✅ Botón de Dashboard solo activo si pin y reconocimiento son correctos */}
                                    <button
                                        onClick={handleDashboardClick}
                                        className="mt-4 w-full py-2 rounded text-white shadow 
                                        bg-purple-600 hover:bg-purple-700"
                                    >
                                        Ir al Dashboard
                                    </button>
                                </>
                            ) : (
                                <p className="text-red-400">❌ {result.message}</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
