import React, { useState, useEffect } from 'react'
import { Row, Col, Avatar, Card, Space, Checkbox, Button } from 'antd'
import axios from 'axios'
import qs from 'qs'

import {
  LeftCircleOutlined,
  RightCircleOutlined
} from '@ant-design/icons';


import 'antd/dist/antd.css'

interface Props {
}

interface Following {
  mid: number
  uname: string
  face: string
  sign: string
}

interface RelationTagIn {
  label: string
  value: number
}



const Options: React.FC<Props> = () => {
  const [following, setFollowing] = useState<Following>()
  const [relationTags, setRelationTags] = useState<RelationTagIn[]>([])
  const [cur, setCur] = useState<number>(0)
  const [curRelationTagsList, setcurRelationTagsList] = useState<number[]>([])
  const [csrfToken, setCsrfToken] = useState<string>()
  useEffect(() => {
    chrome.cookies.get(
      {
        name: 'bili_jct',
        url: 'https://space.bilibili.com',
      },
      (cookie) => {
        setCsrfToken(cookie?.value)
      },
    )
    axios
      .get('http://api.bilibili.com/x/relation/tags')
      .then((res) => {
        const rst = res?.data?.data
        setRelationTags(rst.map((item: { name: any; tagid: any; }) => ({ label: item.name, value: item.tagid })))
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    axios
      .get('http://api.bilibili.com/x/relation/followings',
        {
          params: {
            vmid: '384426747',
            ps: 1,
            pn: cur + 1
          }
        }
      )
      .then((res) => {
        const rst = res?.data?.data
        setFollowing(rst.list[0])
        return rst.list[0]
      }).then(res => {
        axios
          .get('http://api.bilibili.com/x/relation/tag/user', { params: { fid: res.mid } })
          .then((res) => {
            const rst = res?.data?.data
            setcurRelationTagsList(Object.keys(rst).map(item => parseInt(item, 10)))
          })
          .catch((error) => {
            console.error(error)
          })
      })
      .catch((error) => {
        console.error(error)
      })
  }, [cur])

  const editRelationTags = () => {
    // axios
    //   .post('http://api.bilibili.com/x/relation/tags/addUsers', qs.stringify({
    //     fids: following?.mid,
    //     tagids: curRelationTagsList.join(),
    //     csrf: csrfToken
    //   }), {
    //     headers: {
    //       'content-type': 'application/x-www-form-urlencoded'
    //     }
    //   })
    //   .then((res) => {
    //     const rst = res?.data?.data
    //     setFollowing(rst.list[0])
    //     return rst.list[0]
    //   })
    //   .catch((error) => {
    //     console.log('🚀 ~ file: Options.tsx ~ line 95 ~ editRelationTags ~ csrfToken', csrfToken)
    //     console.error(error)
    //   })

    axios
      .post('http://api.bilibili.com/x/relation/tag/create', qs.stringify({
        tag: '健身',
        csrf: csrfToken
      }), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Referer': 'https://www.bilibili.com',
          'origin': 'https://www.bilibili.com'
        }
      })
      .then((res) => {
        const rst = res?.data?.data
        setFollowing(rst.list[0])
        return rst.list[0]
      })
      .catch((error) => {
        console.log('🚀 ~ file: Options.tsx ~ line 95 ~ editRelationTags ~ csrfToken', csrfToken)
        console.error(error)
      })

  }


  return (
    <Row justify="center" align="middle" className="options-pages" >
      <Col className='arrow-icon-box' span={4} >
        <LeftCircleOutlined className='arrow-icon' onClick={() => setCur(cur - 1)} />
      </Col>
      <Col span={16} className="card">
        <Card
          title={
            <div className="title">
              <Avatar src={following?.face} shape="circle" size="large" alt={following?.uname} />
              <span>{following?.uname}</span>
            </div>
          }
          extra={<a href={'https://space.bilibili.com/${following?.mid}'} target="_blank">更多信息</a>}
        >
          <Space direction="vertical">
            {
              following?.sign && <span>{following?.sign}</span>
            }
            {
              curRelationTagsList.length === 0 && (
                <span>你并未将该UP放置到任何分组</span>
              )
            }
            {
              curRelationTagsList.length !== 0 && (
                <span>你将该UP放置到：{curRelationTagsList.join()} 分组</span>
              )
            }
            <Checkbox.Group
              className="checkbox"
              options={relationTags}
              value={curRelationTagsList?.length === 0 ? [0] : curRelationTagsList}
              onChange={(val: any[]) => setcurRelationTagsList(val)}
            />
            <Button onClick={editRelationTags}>确定</Button>
          </Space>
        </Card>
      </Col>
      <Col className='arrow-icon-box' span={4}>
        <RightCircleOutlined className='arrow-icon' onClick={() => setCur(cur + 1)} />
      </Col>
    </Row >
  )
}

export default Options
