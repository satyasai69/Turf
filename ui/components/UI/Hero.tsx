import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import DownloadButtons from '../General/DownloadButtons';
import HeroDecor from './HeroDecor';
import { motion } from 'framer-motion';
import { item, container } from '@/utils/motionVariants';

const Hero = () => {
  return (
    <Wrapper>
      <HeroDecor />
      <Inner>
        <Header
          initial="hidden"
          whileInView="visible"
          variants={container}
          viewport={{ once: true, amount: 0.5 }}
        >
          <H1 variants={item}>
            Launch ,Grow ,Earn  <span> Together </span> As An Influencer
          </H1>
          <P variants={item}>
            Create your custom decentralized exchange in minutes. Set your own trading pairs,
            earn from every transaction, and build your crypto community. No coding required.{' '}
            <span>Join the future of decentralized trading today!</span>
          </P>
        </Header>
        <Div>
          <DownloadButtons />
        </Div>
        <ImageContainer>
          <Image
            src="/images/hero_image.png"
            alt="hero image"
            width={520}
            height={450}
          />
        </ImageContainer>
      </Inner>
    </Wrapper>
  );
};

export default Hero;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2% 0 0 0;
  background-color: #f4a460;
  position: relative;
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 2%;
  }
`;

const Inner = styled.div`
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Div = styled.div`
  margin: 0.5em 0 2em;
`;

const Header = styled(motion.div)`
  flex: 1;
  padding: 0 2%;
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const H1 = styled(motion.h1)`
  font-family: var(--font-family-clash-display);
  font-weight: var(--font-weight-semi-bold);
  font-size: 3.1rem; // 50px
  line-height: 1.2;
  margin-bottom: 1rem;
  text-align: center;

  span {
    color: var(--color-orange);
  }
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const P = styled(motion.p)`
  display: flex;
  flex-direction: column;
  padding: 0 2em;
  font-family: var(--font-family-lufga);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xl);
  line-height: var(--line-height-xl);
  text-align: center;
  position: relative;
  z-index: 4;
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0;
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  margin-bottom: 0;
  position: relative;
  z-index: 3;
  @media (max-width: 768px) {
    width: 90%;
    margin: 0 auto -3rem;
  }

  img {
    object-fit: contain;

    @media (max-width: 768px) {
      width: 100%;
    }
  }
`;