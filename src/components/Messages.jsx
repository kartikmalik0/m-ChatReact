import { Avatar, HStack,Text } from '@chakra-ui/react'
import React from 'react'

const Messages = ({text,uri,user='other'}) => {
  return (
      <HStack borderRadius={'base'} alignSelf={user === 'me' ? 'flex-end' : 'flex-start'} bg={'gray.100'} paddingX={4} paddingY={2}>
        {
              user==='other'&&<Avatar  src={uri}/>
          }
          <Text>
              {text}
          </Text>
          {
              user==='me'&&<Avatar src={uri}/>
          }
    </HStack>
  )
}

export default Messages
