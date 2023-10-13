// ==UserScript==
// @name       mastodon-on-elk
// @namespace  https://elk.zone/framapiaf.org/@Riduidel
// @version    0.1
// @description  Redirects all mastodon servers I know to be seen in the excellent https://elk.zone/ mastodon UI.
// @match      https://*/*
// @match      http://*/*
// @noframes
// @run-at document-start
// @grant GM.getValue
// @grant GM.setValue
// @grant GM.xmlHttpRequest
// ==/UserScript==

const PREFIX = "mastodon-on-elk"
const KEY = "mastodon-on-elk"

function receiveServerList(response) {
  console.info(PREFIX, "Received server list from GtiHub")
  const servers = response.responseText.split("\n")
  	.map(text => {
    	if(text.indexOf("\"")==0) {
        text = text.substring(1)
      }
      if(text.lastIndexOf("\"")==text.length-1) {
        text = text.substring(0, text.length-1)
      }
      return text
  	})

  const config = {
    "date": new Date(),
    "servers": servers
  }
  console.info(PREFIX, "Obtained server list", config)
  GM.setValue(KEY, JSON.stringify(config))
}

function fireRefreshServerList() {
  GM.xmlHttpRequest({
    method: "GET",
    url: "https://raw.githubusercontent.com/Riduidel/mastodon-on-elk/servers/servers.json",
    onload: receiveServerList
  });
}

function ensureServerListIsFresh(mastodonOnElk) {
  if(mastodonOnElk==null) {
    fireRefreshServerList()
  } else {
    const config = JSON.parse(mastodonOnElk)
    if(config.date<new Date().getTime()-1000*60*60*24*7) {
      fireRefreshServerList()
	    console.info(PREFIX, "There is a mastodon to elk config that is TOO OLD")
    } else {
	    console.info(PREFIX, "There is a mastodon to elk config that is young enough")
    }
  }
}

function redirectMastodonToElk(configText) {
  const config = JSON.parse(configText)
  console.info(PREFIX, "We have a valid mastodon config, testing server url", window.location, "⁉️")
  const server = window.location.host
  if(config.servers.includes(server)) {
	  console.info(PREFIX, "Looks like a mastodon server! Redirecting! ⚡")
  	window.location.href = `https://elk.zone/${server}${window.location.pathname}`
  } else {
    console.info(PREFIX, "This is not a mastodon server ❌")
  }
}

GM.getValue(KEY)
  	.then(ensureServerListIsFresh)
	;
GM.getValue(KEY)
  	.then(redirectMastodonToElk)
	;