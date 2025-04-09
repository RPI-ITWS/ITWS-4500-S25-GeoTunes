const { useState, useEffect } = React;

// Main Add Song Component
function AddSongPage() {
    const [songs, setSongs] = useState([]);
    const [formData, setFormData] = useState({ title: '', artist: '' });
    const [status, setStatus] = useState({ message: '', isError: false });

    useEffect(() => {
        fetchPlaylist();
    }, []);

    const fetchPlaylist = async () => {
        try {
            const response = await fetch('/api/songs');
            if (!response.ok) throw new Error('Failed to load playlist');
            const data = await response.json();
            setSongs(data);
        } catch (error) {
            setStatus({ message: error.message || 'Error loading playlist', isError: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.artist) {
            setStatus({ message: 'Please fill in both fields', isError: true });
            return;
        }

        try {
            const response = await fetch('/api/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add song');
            }

            setSongs([data, ...songs]);
            setFormData({ title: '', artist: '' });
            setStatus({ message: 'Song added successfully!', isError: false });
        } catch (error) {
            setStatus({ message: error.message || 'Error adding song', isError: true });
        }
    };

    return (
        <div className="page-container">
            <div className="main-content">
                <h2 style={{ textAlign: 'center' }}>Add to Community Playlist</h2>
                
                <form onSubmit={handleSubmit} className="song-form">
                    <input
                        type="text"
                        placeholder="Song Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Artist Name"
                        value={formData.artist}
                        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    />
                    <button type="submit">Add Song</button>
                    
                    {status.message && (
                        <div className={`status-message ${status.isError ? 'error' : 'success'}`}>
                            {status.message}
                        </div>
                    )}
                </form>

                <div className="playlist-container">
                    <h3 style={{ textAlign: 'center' }}>Current Community Playlist</h3>
                    {songs.length > 0 ? (
                        <ul className="playlist-list">
                            {songs.map((song) => (
                                <li key={song._id} className="playlist-item">
                                    <span className="song-title">{song.title}</span>
                                    <span className="song-artist">by {song.artist}</span>
                                    <span className="song-date">
                                        {new Date(song.created_at).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-playlist">
                            No songs in the playlist yet. Be the first to add one!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Initialize React App
ReactDOM.render(
    React.createElement(AddSongPage),
    document.getElementById('root')
);