import { getProviders, signIn } from 'next-auth/react'

import Flex from '@shared/Flex'
import Text from '@shared/Text'
import Button from '@shared/Button'
import Spacing from '@shared/Spacing'

function SigninPage({ providers }: { providers: any }) {
  return (
    <div>
      <Spacing size={100} />
      <Flex direction="column" align="center">
        <Text bold={true}>My Account</Text>
        <Spacing size={80} />
        <ul>
          {providers && Object.values(providers).map((provider: any) => (
            <li key={provider.id}>
              <Button onClick={() => signIn(provider.id, { callbackUrl: '/' })}>
                {provider.name} LOGIN
              </Button>
            </li>
          ))}
        </ul>
      </Flex>
    </div>
  )
}

export async function getServerSideProps() {
  const providers = await getProviders()

  return {
    props: {
      providers: providers || {},
    },
  }
}

export default SigninPage
