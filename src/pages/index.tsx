import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';


import { IoCalendarClearOutline } from "react-icons/io5";
import { BiUser } from "react-icons/bi";
import { useState } from 'react';


import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const formatPosts = (posts: PostPagination) => {
    console.log(posts)
    const postsFormatted: Post[] = posts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: new Date(
          post.first_publication_date
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    return postsFormatted
  }

  async function getNextPage() {
    if(!nextPage) return
    const nextPagePosts = await fetch(nextPage)
    const nextPagePostResult: PostPagination = await nextPagePosts.json()
    const fomattedNewPosts = formatPosts(nextPagePostResult)

    setPosts([...posts, ...fomattedNewPosts])
    setNextPage(nextPagePostResult.next_page)

  }
  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>
      <main className={commonStyles.container}>

        <div className={styles.postsContent}>
          <img src="/logo.svg" alt="logo" />

          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles.infoContainer}>
                <time><IoCalendarClearOutline />{post.first_publication_date}</time>
                <label><BiUser />{post.data.author}</label>
                </div>
                
              </a>
            </Link>
          ))}
          {nextPage ? <button onClick={getNextPage} >Carregar mais posts</button> : <></>}
        </div>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
