import { GetStaticProps } from "next";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Edit from "../components/edit";
import { ErrorDialog } from "../components/error";
import Malleable, { FieldEdit } from "../components/malleable";
import Snapshot from "../components/snapshot";
import { useScrollReset } from "../hooks/use-scroll-reset";
import layoutStyles from "../styles/layout.module.css";
import clientPromise from "../lib/db";

export const getStaticProps: GetStaticProps = async () => {
  // Grab the latest data for the page from Mongodb
  const client = await clientPromise;
  const db = await client.db("radiant-light");
  const collection = await db.collection("contents");
  const latestPost = await collection
    .find({}, { projection: { _id: 0 } }) // Find all documents without _id
    .sort({ timestamp: -1 }) // Sort by timestamp in descending order (most recent first)
    .limit(1) // Limit the result to just one document
    .toArray();

  return { props: { isPreview: false, latestPost } };
};

export default function Home(props) {
  // Scroll to top on mount as to ensure the user sees the "Preview Mode" bar
  useScrollReset();
  const { latestPost } = props;
  console.log(latestPost);

  const [latestPostContents, setLatestPostContents] = useState([]);
  useEffect(() => {
    if (latestPost) {
      setLatestPostContents(latestPost[0].contents);
    }
  }, [latestPost]);

  const [currentSnapshotId, setSnapshotId] = useState(null);
  const clearSnapshot = useCallback(() => setSnapshotId(null), [setSnapshotId]);

  const [isPreviewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [isEdit, setEdit] = useState(false);
  const toggleEdit = useCallback(() => {
    setPreviewMode(false);
    setEdit(!isEdit);
  }, [isEdit, isPreviewMode]);

  // Prevent duplication before re-render
  const hasSaveRequest = useRef(false);
  const [isSharingView, _setSharing] = useState(false);
  const setSharing = useCallback(
    (sharing: boolean) => {
      hasSaveRequest.current = sharing;
      _setSharing(sharing);
    },
    [hasSaveRequest, _setSharing]
  );

  const [currentError, setError] = useState<Error>(null);
  const onClearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const share = useCallback(() => {
    if (hasSaveRequest.current) return;
    setSharing(true);

    const els = document.querySelectorAll("[id] > [contenteditable=true]");
    const persistContents: FieldEdit[] = [].slice
      .call(els)
      .map(({ parentNode: { id }, innerText }) => ({ id, innerText }));
    // We'll just save any changes directly.

    // ? It will - save the data to mongodb
    // ? It will - do a revalidate ISG
    // ? It will - reload the window once or twice to see the latest info live.
    // ... ### ... //
    // ... ### ... //
    // ... ### ... //
    // ... ### ... //

    self
      .fetch(`/api/save`, {
        method: "POST",
        body: JSON.stringify(persistContents),
        headers: { "content-type": "application/json" },
      })
      .then((res) => {
        if (res.ok) return res.json();
        return new Promise(async (_, reject) =>
          reject(new Error(await res.text()))
        );
      })
      .then((res) => {
        (self as any)
          .fetch(`/api/revalidate`, {
            method: "GET",
          })
          .then((res) => {
            if (res.ok) return res.json();
            return new Promise(async (_, reject) =>
              reject(new Error(await res.text()))
            );
          })
          .then((res) => {
            window.location.reload();
            window.location.reload();
            console.log(res);
          });
      })

      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setSharing(false);
      });
  }, []);

  const edits = props.isPreview ? props.contents : [];

  return (
    <>
      <Head>
        <title>Next.js | Preview Mode</title>
        <meta
          name="description"
          content="This website demonstrates a static website generated using Next.js' new Static Site Generation (SSG)."
        ></meta>
      </Head>
      {currentError && (
        <ErrorDialog onExit={onClearError}>
          <p>
            An error occurred while saving your snapshot. Please try again in a
            bit.
          </p>
          <pre>{currentError.message}</pre>
        </ErrorDialog>
      )}

      <div className={layoutStyles.layout}>
        <Content
          isEdit={isEdit}
          edits={edits}
          latestPostContents={latestPostContents}
        />
      </div>
      {isEdit ? (
        <>
          <Snapshot
            onCancel={toggleEdit}
            onShare={share}
            isSharing={isSharingView}
          />
        </>
      ) : (
        <Edit onClick={toggleEdit} />
      )}
    </>
  );
}

function Content({
  isEdit,
  edits,
  latestPostContents,
}: {
  isEdit: boolean;
  edits: FieldEdit[];
  latestPostContents: FieldEdit[];
}) {
  const idToInnerTextMap = useMemo(
    () =>
      latestPostContents.reduce((acc, item) => {
        acc[item.id] = item.innerText;
        return acc;
      }, {}),
    [latestPostContents]
  );

  return (
    <>
      <Malleable id="title" as="h1" isActive={isEdit} edits={edits}>
        {idToInnerTextMap["title"]}
      </Malleable>
      <div className="features">
        <div className="feature">
          <Malleable
            id="feature-1-emoji"
            as="div"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["feature-1-emoji"]}
          </Malleable>
          <Malleable
            id="feature-1-text"
            as="h4"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["feature-1-text"]}
          </Malleable>
        </div>
        <div className="feature">
          <Malleable
            id="feature-2-emoji"
            as="div"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["feature-2-emoji"]}
          </Malleable>
          <Malleable
            id="feature-2-text"
            as="h4"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["feature-2-text"]}
          </Malleable>
        </div>
        <div className="feature">
          <Malleable
            id="feature-3-emoji"
            as="div"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["feature-3-emoji"]}
          </Malleable>
          <Malleable
            id="feature-3-text"
            as="h4"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["feature-3-text"]}
          </Malleable>
        </div>
      </div>
      <Malleable as="h2" id="title-2" isActive={isEdit} edits={edits}>
        {idToInnerTextMap["title-2"]}
      </Malleable>
      <div className="explanation">
        <div className="p">
          <Malleable
            id="explanation-1-inspect"
            as="span"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["explanation-1-inspect"]}
          </Malleable>
          <br />
          <Malleable
            id="explanation-1-pre-curl"
            as="pre"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["explanation-1-pre-curl"]}
          </Malleable>
          <Malleable
            id="explanation-1-pre-response"
            as="pre"
            className="light"
            isActive={isEdit}
            edits={edits}
          >
            {idToInnerTextMap["explanation-1-pre-response"]}
          </Malleable>
        </div>
        <Malleable id="explanation-2" isActive={isEdit} edits={edits}>
          {idToInnerTextMap["explanation-2"]}
        </Malleable>
        <Malleable id="explanation-3" isActive={isEdit} edits={edits}>
          {idToInnerTextMap["explanation-3"]}
        </Malleable>
        <Malleable id="explanation-4" isActive={isEdit} edits={edits}>
          {idToInnerTextMap["explanation-4"]}
        </Malleable>
      </div>
    </>
  );
}
