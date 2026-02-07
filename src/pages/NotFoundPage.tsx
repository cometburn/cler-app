// Import images statically or put them in /public/404-1.png, etc.
const images = ["/404-1.png", "/404-2.png", "/404-3.png"];

export default function NotFound() {
    const randomSrc = images[Math.floor(Math.random() * images.length)];

    return (
        <div className="w-full h-[100vh] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Page Not Found
                </h2>
                <img
                    src={randomSrc}
                    className="w-auto mx-auto h-auto px-8 py-10 max-w-[500px]"
                />
                <p className="text-gray-500 mb-8">
                    The page you're looking for doesn't exist.
                </p>
            </div>
        </div>
    );
}
