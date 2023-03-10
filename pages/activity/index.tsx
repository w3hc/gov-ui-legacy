import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { ethers } from "ethers";
import { useState, useEffect, useCallback } from "react";
import { abi } from "../../constants/abi";

const inter = Inter({ subsets: ['latin'] })

const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
const provider = new ethers.providers.JsonRpcProvider(endpoint);
const contractAddress = "0x690C775dD85365a0b288B30c338ca1E725abD50E";
const gov = new ethers.Contract(contractAddress, abi, provider);
const baseUrl = "https://www.tally.xyz/gov/girlygov-64/proposal/"

export default function Home() {
  const [block, setBlock] = useState(0);
  const [manifesto, setManifesto] = useState("");
  const [proposal, setProposal] = useState<{id:string; link:string}[]>([{
    id: "12345678",
    link: "http://link.com"
  },]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    getBlock();
    getManifesto();
  },[]);
  
  const getBlock = async () => {
    const blockNumber = await provider.getBlockNumber();
    setBlock(blockNumber);
  }

  const getManifesto = async () => {
    const getManifesto = await gov.manifesto();
    setManifesto(getManifesto);
  }

  const getProposals = useCallback( async () => {
    if (block > 1) {
      const proposals = await gov.queryFilter("ProposalCreated", 8251080, block);
      try {

        let i:number = 0;
        let proposalsRaw = proposal;

        if (proposals[0].args != undefined) {
          for( i; i < Number(proposals.length) ; i++) {
            // console.log("executed:", String(proposals[i].args?.proposalId))
            proposalsRaw.push(...[{
              id: String(proposals[i].args?.proposalId), 
              link: baseUrl + String(proposals[i].args?.proposalId)
            }])
          }
          delete proposal[0];
          setProposal(proposalsRaw);
          // console.log("proposal post loop:", proposal);
          setInitialized(true);
        }
      } catch(error) {
        console.log("error:", error)
      }
    }
  },[block, proposal])

  useEffect(() => {
    getProposals();
    // console.log("proposal in useEffect:", proposal);

  },[getProposals, proposal]);

  function Item(props) {
    return <p><strong><a style={{color:"#45a2f8"}} target="_blank" rel="noopener noreferrer" href = {props.link}>{props.id}</a></strong></p>
  } 
  
  function List() {
    return (
      <div className={inter.className}>
          {proposal.map((p) => <Item key={p.id} id={p.id} link={p.link} />)}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Gov UI</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
      <div className={styles.description}>
          <p>
          <a
              href="https://github.com/w3hc/gov"
              target="_blank"
              rel="noopener noreferrer"
            >Gov
          </a>
          </p>
          <div>
            <a
              href="https://github.com/w3hc"
              target="_blank"
              rel="noopener noreferrer"
            >
            </a>
          </div>
        </div>

        {initialized === true ? <>
        
        <div className={inter.className}>
  
          <p>Current block number: <strong>{block}</strong></p><br />
          <p>Gov contract address: <strong><a style={{color:"#45a2f8"}} target="_blank" rel="noopener noreferrer" href="https://goerli.etherscan.io/address/0x690C775dD85365a0b288B30c338ca1E725abD50E#code">{contractAddress}</a></strong></p><br />
          <p>Manifesto: <a style={{color:"#45a2f8"}} target="_blank" rel="noopener noreferrer" href="https://bafybeihmgfg2gmm23ozur3ylmkxgwkyr5dlpruivv3wjeujrdktxihqe3a.ipfs.w3s.link/manifesto.md"><strong>{manifesto}</strong></a></p><br />
          
          <h3>All proposals </h3><br />

          <List />
          
        </div></>

        : <p className={inter.className}>Loading...</p>}

        <div className={styles.grid}>
          <Link
            href="/"
            className={styles.card}
            
          >
            <h2 className={inter.className}>
              Home <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              What&apos;s happening on your homepage?
            </p>
          </Link>
        </div>
      </main>
    </>
  )
}
