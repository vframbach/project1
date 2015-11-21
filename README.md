
The goal of this project is to create a more organized way to store and refer back to saved comments on Reddit, with the use of "tags".

Mongo models:

- [ ] User
  - [ ] username
  - [ ] api token

- [ ] SavedItem
  - [ ] User ref
  - [ ] item id(base32) and display string
  - [ ] url
  - [ ] subreddit id(base32) and display string

- [ ] ItemTag
  - [ ] SavedItem ref
  - [ ] list of tag strings

api endpoints needed:

- [ ] login/logout
- [ ] get user info
  - [ ] reddit profile info (name, link to profile)
  - [ ] list of tags
- [ ] find saved items for a user
  - [ ] filter by items that contain a tag string
  - [ ] filter by items that are in a subreddit
  - [ ] filter by items that contain a content string
- [ ] Add tag to item
- [ ] Remove tag from item
- [ ] Unsave an item (items are saved via reddit ui)

frontend:

- [ ] nice to have: tag autocomplete input box
