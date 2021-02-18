const c1 = () => import(/* webpackChunkName: "page--src--pages--user--id-vue" */ "/Users/lpz/code/my-gridsome-site/src/pages/user/[id].vue")
const c2 = () => import(/* webpackChunkName: "page--src--pages--posts2-vue" */ "/Users/lpz/code/my-gridsome-site/src/pages/Posts2.vue")
const c3 = () => import(/* webpackChunkName: "page--src--templates--post-vue" */ "/Users/lpz/code/my-gridsome-site/src/templates/Post.vue")
const c4 = () => import(/* webpackChunkName: "page--src--pages--posts1-vue" */ "/Users/lpz/code/my-gridsome-site/src/pages/Posts1.vue")
const c5 = () => import(/* webpackChunkName: "page--src--templates--my-page-vue" */ "/Users/lpz/code/my-gridsome-site/src/templates/MyPage.vue")
const c6 = () => import(/* webpackChunkName: "page--src--pages--foo-vue" */ "/Users/lpz/code/my-gridsome-site/src/pages/Foo.vue")
const c7 = () => import(/* webpackChunkName: "page--src--pages--about-vue" */ "/Users/lpz/code/my-gridsome-site/src/pages/About.vue")
const c8 = () => import(/* webpackChunkName: "page--node-modules--gridsome--app--pages--404-vue" */ "/Users/lpz/code/my-gridsome-site/node_modules/gridsome/app/pages/404.vue")
const c9 = () => import(/* webpackChunkName: "page--src--pages--index-vue" */ "/Users/lpz/code/my-gridsome-site/src/pages/Index.vue")

export default [
  {
    name: "__user_id",
    path: "/user/:id/",
    component: c1,
    meta: {
      dataPath: "/user/_id.json",
      dynamic: true
    }
  },
  {
    path: "/posts2/:page(\\d+)?/",
    component: c2
  },
  {
    path: "/posts/:id/",
    component: c3
  },
  {
    path: "/posts1/",
    component: c4
  },
  {
    path: "/my-page/",
    component: c5
  },
  {
    path: "/foo/",
    component: c6
  },
  {
    path: "/about/",
    component: c7
  },
  {
    name: "404",
    path: "/404/",
    component: c8
  },
  {
    name: "home",
    path: "/",
    component: c9
  },
  {
    name: "*",
    path: "*",
    component: c8
  }
]
