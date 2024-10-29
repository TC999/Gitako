import { raiseError } from 'analytics'
import { sanitizedLocation } from 'utils/URLHelper'

export function parse(): Partial<Pick<MetaData, 'userName' | 'repoName' | 'type'>> & {
  path: string[]
} {
  const [
    ,
    // ignore content before the first '/'
    userName,
    repoName,
    type,
    ...path // should be [...branchName.split('/'), ...filePath.split('/')]
  ] = unescape(decodeURIComponent(sanitizedLocation.pathname)).split('/')
  return {
    userName,
    repoName,
    type,
    path,
  }
}

// not working well with non-branch blob
// cannot handle '/' split branch name, should not use when possibly in branch page
export function parseSHA() {
  const { type, path } = parse()
  return type === 'blob' || type === 'tree' || type === 'commit' ? path[0] : undefined
}

export function isInPullPage() {
  const { type, path } = parse()
  return type === 'pull' ? path[0] : false
}

export function isInCommitPage() {
  const { type, path } = parse()
  return type === 'commit' ? path[0] : false
}

export function isCommitPath(path: string[]) {
  return path[0] ? isCompleteCommitSHA(path[0]) : false
}

export function isCompleteCommitSHA(sha: string) {
  return /^[abcdef0-9]{40}$/i.test(sha)
}

export function isPossiblyCommitSHA(sha: string) {
  return /^[abcdef0-9]+$/i.test(sha)
}

export function getCurrentPath(branchName = '') {
  const { path, type } = parse()
  if (type === 'blob' || type === 'tree') {
    if (isCommitPath(path)) {
      // path = commit-SHA/path/to/item
      path.shift()
    } else {
      // path = branch/name/path/to/item or HEAD/path/to/item
      // HEAD is not a valid branch name. Getting HEAD means being detached.
      if (path[0] === 'HEAD') path.shift()
      else {
        const splitBranchName = branchName.split('/')
        if (
          splitBranchName.length === 1 &&
          path.length > 0 &&
          isPossiblyCommitSHA(splitBranchName[0]) &&
          isPossiblyCommitSHA(path[0]) &&
          (splitBranchName[0].startsWith(path[0]) || path[0].startsWith(splitBranchName[0]))
          // This happens when visiting URLs like /blob/{commitSHA}/path/to/file
          // and {commitSHA} does not match the one got from DOM
        ) {
          splitBranchName.shift()
          path.shift()
        } else {
          while (splitBranchName.length) {
            if (splitBranchName[0] === path[0]) {
              splitBranchName.shift()
              path.shift()
            } else {
              raiseError(new Error(`分支名称和路径前缀不匹配`), {
                branchName,
                path: parse().path,
              })
              return []
            }
          }
        }
      }
    }
    return path.map(decodeURIComponent)
  }
  return []
}

export function getItemUrl(
  userName: string,
  repoName: string,
  branchName: string,
  type = 'blob',
  path = '',
) {
  // Modern browsers have great support for handling unsafe URL,
  // It may be possible to sanitize path with
  // `path => path.includes('#') ? path.replace(/#/g, '%23') : '...'
  return `${window.location.origin}/${userName}/${repoName}/${type}/${branchName}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`
}
