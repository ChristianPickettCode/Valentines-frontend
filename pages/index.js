import { useState, useEffect } from "react";

import Head from 'next/head'
// import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { ethers } from "ethers";
import Valentines from "./artifacts/Valentines.json"
import { Box, Button, Image, Input, Text, Link, Heading } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
// polygon old: 0xcb137655081D91C4b7cC40801f1FECd858A27dda
const CONTRACT_ADDRESS = "0x5dF3ff8EF26C57d5D3b2A0273CA93Ba2dAb63F36"; //rinkeby : 0xC673De6bA1a4617361Ea492B3939E3E2F3DfAD91

const BASE_ES_URL = "https://polygonscan.com/tx/";
const OS_COLLECTION_URL = "https://opensea.io/collection/valentines-day-poem";

export default function Home() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState();
  const [textArr, setTextArr] = useState(["","","","","","","",""]);
  const [minedHash, setMinedHash] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const checkNetwork = async () => {
    const { ethereum } = window;
    try { 
      if (ethereum.networkVersion !== '137') {
        alert(`❤️ Please connect to the Polygon Network ❤️`)
        console.log(ethereum.networkVersion)
      }
    } catch(error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async() => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch(error) {
      console.log(error);
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const mint = async () => {
    checkNetwork();
    try {
      if(contract) {
        if (ethereum.networkVersion !== '137') {
          alert(`❤️ Please connect to the Polygon Network ❤️`)
          console.log(ethereum.networkVersion)
        } else {
          console.log('Minting card in progress...');
        
          const mintTxn = await contract.mint(textArr);
          setIsLoading(true);
          await mintTxn.wait();
          // console.log('mintTxn: ', mintTxn);
          // console.log(`https://rinkeby.etherscan.io/tx/${mintTxn.hash}`)
          setMinedHash(mintTxn.hash)
          setIsLoading(false);

        }
      }
    } catch(error) {
      console.warn("MintCardAction Error:", error);
    }
  }

  useEffect(() => {
    const connectToContract = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Valentines.abi,
        signer
      );

      setContract(_contract);
    }
    
    if (currentAccount) {
      console.log('CurrentAccount', currentAccount);
      // fetchNFTMetadata();
      connectToContract();
    }
  }, [currentAccount]);

  useEffect(() => {
    checkIfWalletIsConnected();
    checkNetwork();
    
  }, []);

  const update = (text, index) => {
    let newUpdate = textArr;
    newUpdate[index] = text;
    setTextArr(newUpdate);
  }

  return (
    <div className={styles.container}>
      <Button colorScheme="pink" variant="outline" style={{position:"absolute", right:"20px", top:"20px"}}><a target="_blank" rel="noopener noreferrer" href={OS_COLLECTION_URL}>Collection</a></Button>
      <Head>
        <title>Mint A Poem</title>
        <meta name="description" content="Mint a poem" />
      </Head>

      <main className={styles.main}>
      <Heading>Mint A Poem</Heading>
      <Box bg='#F687B3' w='300px' h="300px" p={4} color='white' style={{fontFamily:"Arial, Verdana"}}>
        <Input _placeholder={{ color: 'grey' }} size='sm' variant='unstyled' placeholder='You' onChange={(e) =>update(e.target.value, 0)}></Input>
        <Input _placeholder={{ color: 'grey' }} size='sm' variant='unstyled' placeholder='have' onChange={(e) =>update(e.target.value, 1)}></Input>
        <Input _placeholder={{ color: 'grey' }} size='sm' variant='unstyled' placeholder='8' onChange={(e) =>update(e.target.value, 2)}></Input>
        <Input _placeholder={{ color: 'grey' }} size='sm' variant='unstyled' placeholder='lines (max 56 char per line)' onChange={(e) =>update(e.target.value, 3)}></Input>
        <Input _placeholder={{ color: 'grey' }} size='sm' variant='unstyled' placeholder='to' onChange={(e) =>update(e.target.value, 4)}></Input>
        <Input _placeholder={{ color: 'grey' }} size='sm' variant='unstyled' placeholder='write' onChange={(e) =>update(e.target.value, 5)}></Input>
        <Input _placeholder={{ color: 'grey' }} size='sm' variant='unstyled' placeholder='a' onChange={(e) =>update(e.target.value, 6)}></Input>
        <Input _placeholder={{ color: 'grey' }} size='sm' variant='unstyled' placeholder='poem ❤️' onChange={(e) =>update(e.target.value, 7)}></Input>
        <br />
        <br />
        <br />
        <Text color="white">Happy Valentines Day</Text>
      </Box>
        {!currentAccount ? 
        <Button style={{marginTop:"10px"}} w="300px" colorScheme='pink' variant='solid' onClick={connectWalletAction}>Connect</Button>
        : 
        <Button isLoading={isLoading} loadingText='minting poem' style={{marginTop:"10px"}} w="300px" colorScheme='pink' variant='outline' onClick={mint}>Mint</Button>
        }
        <br />
        { minedHash ? 
          <div>
            <Link href={`${BASE_ES_URL}${minedHash}`} isExternal>
              Check in polyscan <ExternalLinkIcon mx='2px' />
            </Link>
            <Link href={OS_COLLECTION_URL} isExternal>
              And Opensea <ExternalLinkIcon mx='2px' />
            </Link>
          </div>
        : ""}
      </main>

      <footer className={styles.footer}>
        <b>
          <a
            href="https://twitter.com/esotterik"
            target="_blank"
            rel="noopener noreferrer"
          >
            @esotterik
          </a>
        </b>
      </footer>
    </div>
  )
}
