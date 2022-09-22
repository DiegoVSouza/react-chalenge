import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismicio';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter()
  const contentWordsBody = post.data.content.map(content => RichText.asText(content.body).split(' ')
  ).reduce((previousValue, currentValue) => [...currentValue, ...previousValue], []).filter(i => i !== ' ')

  const contentWordsHeading = post.data.content.map(content => content.heading.split(' ')
  ).reduce((previousValue, currentValue) => [...currentValue, ...previousValue], []).filter(i => i !== ' ')

  const timeReading = Math.ceil((contentWordsHeading.length + contentWordsBody.length) / 200)

  return (
    <>
      {isFallback ? (
        <><Head>
          <title> Post | SpaceTraveling </title>
        </Head>
          <h3>Carregando...</h3>
        </>) :
        <>
          <Head>
            <title> Post | SpaceTraveling </title>
          </Head>

          <main className={styles.mainPost}>
            <img src="" alt="banner" />
            <article className={styles.articlePost}>
              <section>
                <h2>{post.data.title}</h2>
                <label>{post.first_publication_date}</label>
                <label>{post.data.author}</label>
                <label>{timeReading} min</label>
              </section>
              <section>
                {post.data.content.map(content => (
                  <div key={content.heading}>
                    <h3>{content.heading}</h3>
                    {content.body.map(body => (
                      <p>{body.text}</p>
                    ))}
                  </div>

                ))}
              </section>
            </article>
          </main>
        </>
      }
    </>


  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  const slug = posts.results.map(result => (
    { params: { slug: result.uid } }))
  return {
    paths: slug,
    fallback: true
  }
};



export const getStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params
  const response = await prismic.getByUID('posts', slug);
  // console.log(JSON.stringify(response, null, 2))
  const post = {
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content

    },
    author: response.data.author,
  }
  return {
    props: {
      post
    }
  }

  // TODO
};
