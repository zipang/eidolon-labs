# EIDOLON LABS

This is my personal website.

## INSTALLATION

```sh
> yarn
```

will provide all the required node.js modules used for the build.

## BUILD

The whole site is statically generated with Metalsmith, based on the markdown content found in `content/` and the theme assets found in `theme/`. 

```sh
> yarn run build
```

## DEPLOYMENT

```sh
> git push origin master
```

Yep ! Commiting to master will trigger a Netlify rebuild and make the new site available.
