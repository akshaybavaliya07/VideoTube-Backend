# VideoTube

This is a ``VideoTube`` backend project that covers allmost the functionalities of youtube 
and also combines the tweet functionality. Find more about his project in the documentaion below.


## Important links
| Content            | Link                                                                        |
| -------------------| ----------------------------------------------------------------------------|
| API Documentation  | [click here](https://documenter.getpostman.com/view/33710032/2sA3rwMtq6)    |
| Model              | [click here](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)         |


## Features

### User Management:

- User registration, login, logout, and password reset
- Profile management including avatar and cover image updates
- Watch history tracking

### Video Management:

- Uploading and publishing videos
- Searching, sorting, and paginating videos
- Editing video titles and descriptions
- Deleting videos
- Toggling video visibility (publish/unpublish)

### Subscription Management:

- Subscribing to channels
- Fetching the list of subscribers for a channel
- Fetching the list of channels a user is subscribed to

### Playlist Management:
- Creating, updating, and deleting playlists
- Adding and removing videos from playlists
- Viewing user playlists

### Like Management:

- Liking and unliking videos, comments, and tweets
- Viewing liked videos

### Comment Management:

- Adding, updating, and deleting comments on videos
- Fetching comments for a specific video

### Tweet Management:

- Creating and publishing tweets
- Viewing tweets of a specific user
- Updating and deleting tweets

## Dashboard:  

- Viewing channel statistics including views, subscribers, videos, and likes
- Accessing uploaded videos


## Technologies Used

- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary for image and video storage
- **Others**: bcrypt.js for password hashing, multer for file uploads