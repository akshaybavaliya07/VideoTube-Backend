import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist } from '../controllers/playlist.controller.js'

const route = Router();

route.use(verifyJWT)
.post('/', createPlaylist)
.get('/:playlistId', getPlaylistById)
.patch('/:playlistId', updatePlaylist)
.delete('/:playlistId', deletePlaylist)
.get('/user/:userId', getUserPlaylists)
.post('/:playlistId/video/:videoId', addVideoToPlaylist)
.delete('/:playlistId/video/:videoId', removeVideoFromPlaylist)

export default route